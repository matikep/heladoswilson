import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { database, auth, googleProvider } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import './Admin.css'

interface Product {
  id: number
  name: string
  price: number
  icon: string
  stock: number
}

interface OrderItem {
  id: number
  name: string
  price: number
  icon: string
  quantity: number
}

interface Order {
  id: string
  customerName: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'rejected'
  timestamp: number
  createdAt: string
}

// Lista blanca de emails autorizados para acceder al panel admin
const AUTHORIZED_EMAILS = [
  'matikep@gmail.com'
  // Agrega más emails aquí si necesitas dar acceso a más personas
  // 'empleado@gmail.com',
  // 'familia@gmail.com',
]

function Admin() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    icon: '🍦',
    stock: 10
  })

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      
      if (currentUser?.email) {
        // Verificar si el email está en la lista blanca
        const authorized = AUTHORIZED_EMAILS.includes(currentUser.email)
        setIsAuthorized(authorized)
        
        if (!authorized) {
          // Si no está autorizado, cerrar sesión automáticamente
          signOut(auth)
          alert('❌ No tienes permisos para acceder al panel de administración.')
        }
      } else {
        setIsAuthorized(false)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAuthorized) return

    // Escuchar cambios en el stock
    const stockRef = ref(database, 'stock')
    const unsubscribeStock = onValue(stockRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setProducts(data)
      } else {
        // Inicializar con productos por defecto
        const defaultProducts: Product[] = [
          { id: 1, name: 'Chocolate', price: 600, icon: '🍫', stock: 10 },
          { id: 2, name: 'Oreo', price: 600, icon: '🍪', stock: 10 },
          { id: 3, name: 'Manjarate', price: 700, icon: '🍯', stock: 10 },
          { id: 4, name: 'Prestigio', price: 700, icon: '🥥', stock: 10 },
          { id: 5, name: 'Plátano con Leche', price: 600, icon: '🍌', stock: 10 },
        ]
        setProducts(defaultProducts)
        set(stockRef, defaultProducts)
      }
    })

    // Escuchar cambios en los pedidos
    const ordersRef = ref(database, 'orders')
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const ordersArray = Object.values(data) as Order[]
        // Ordenar por timestamp descendente (más recientes primero)
        ordersArray.sort((a, b) => b.timestamp - a.timestamp)
        setOrders(ordersArray)
      } else {
        setOrders([])
      }
    })

    return () => {
      unsubscribeStock()
      unsubscribeOrders()
    }
  }, [isAuthorized])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      // El onAuthStateChanged manejará la verificación del email
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      alert('Error al iniciar sesión con Google. Por favor intenta nuevamente.')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts)
    set(ref(database, 'stock'), updatedProducts)
  }

  const updateStock = (productId: number, newStock: number) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
    )
    saveProducts(updatedProducts)
  }

  const resetAllStock = () => {
    if (confirm('¿Resetear todo el stock a 10 unidades?')) {
      const resetProducts = products.map(p => ({ ...p, stock: 10 }))
      saveProducts(resetProducts)
    }
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      price: product.price,
      icon: product.icon,
      stock: product.stock
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', price: 0, icon: '🍦', stock: 10 })
  }

  const saveEdit = (productId: number) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, ...formData } : p
    )
    saveProducts(updatedProducts)
    cancelEdit()
  }

  const deleteProduct = (productId: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const updatedProducts = products.filter(p => p.id !== productId)
      saveProducts(updatedProducts)
    }
  }

  const addNewProduct = () => {
    if (!formData.name || formData.price <= 0) {
      alert('Por favor completa todos los campos')
      return
    }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1
    const newProduct: Product = {
      id: newId,
      ...formData
    }

    saveProducts([...products, newProduct])
    setShowAddForm(false)
    setFormData({ name: '', price: 0, icon: '🍦', stock: 10 })
  }

  const confirmOrder = (order: Order) => {
    if (!confirm(`¿Confirmar pedido de ${order.customerName}?`)) return

    // Actualizar stock
    const updatedProducts = [...products]
    order.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.id)
      if (productIndex !== -1) {
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          stock: Math.max(0, updatedProducts[productIndex].stock - item.quantity)
        }
      }
    })

    // Guardar productos actualizados
    saveProducts(updatedProducts)

    // Actualizar estado del pedido
    const orderRef = ref(database, `orders/${order.id}`)
    set(orderRef, { ...order, status: 'confirmed' })

    alert('Pedido confirmado y stock actualizado')
  }

  const rejectOrder = (order: Order) => {
    if (!confirm(`¿Rechazar pedido de ${order.customerName}?`)) return

    const orderRef = ref(database, `orders/${order.id}`)
    set(orderRef, { ...order, status: 'rejected' })

    alert('Pedido rechazado')
  }

  const deleteOrder = (orderId: string) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return

    const orderRef = ref(database, `orders/${orderId}`)
    set(orderRef, null)

    alert('Pedido eliminado')
  }

  const deleteAllOrders = () => {
    if (!confirm('⚠️ ¿Estás seguro de eliminar TODOS los pedidos? Esta acción no se puede deshacer.')) return

    const ordersRef = ref(database, 'orders')
    set(ordersRef, null)

    alert('Todos los pedidos han sido eliminados')
  }

  // Función para verificar si un pedido es de hoy
  const isToday = (timestamp: number): boolean => {
    const today = new Date()
    const orderDate = new Date(timestamp)
    return (
      today.getDate() === orderDate.getDate() &&
      today.getMonth() === orderDate.getMonth() &&
      today.getFullYear() === orderDate.getFullYear()
    )
  }

  // Función para obtener el número de pedido (basado en el orden de llegada)
  const getOrderNumber = (order: Order): number => {
    const allOrders = [...orders].sort((a, b) => a.timestamp - b.timestamp)
    return allOrders.findIndex(o => o.id === order.id) + 1
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <span className="loading-icon">🍦</span>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <div className="login-header">
            <span className="login-icon">🔐</span>
            <h1>Panel de Administración</h1>
            <p>Helados Caseros</p>
          </div>
          <div className="login-form">
            <button onClick={handleGoogleSignIn} className="google-signin-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
            <p className="login-info">
              Solo usuarios autorizados pueden acceder
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-panel">
        <div className="admin-header">
          <div>
            <h1>🍦 Panel de Administración</h1>
            <p>Gestión Completa de Productos</p>
          </div>
          <button onClick={handleSignOut} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>

        <div className="admin-actions">
          <button onClick={() => setShowAddForm(!showAddForm)} className="add-btn">
            {showAddForm ? '❌ Cancelar' : '➕ Agregar Nuevo Helado'}
          </button>
          <button onClick={resetAllStock} className="reset-btn">
            🔄 Resetear Stock
          </button>
          {orders.length > 0 && (
            <button onClick={deleteAllOrders} className="delete-all-btn">
              🗑️ Eliminar Todos los Pedidos
            </button>
          )}
          <a href="/" className="view-store-btn">
            👁️ Ver Tienda
          </a>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🍦 Productos ({products.length})
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Pedidos ({orders.filter(o => o.status === 'pending').length})
          </button>
        </div>

        {/* Add New Product Form */}
        {showAddForm && activeTab === 'products' && (
          <div className="product-form-card">
            <h3>➕ Nuevo Helado</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Emoji</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🍦"
                  maxLength={2}
                  className="form-input emoji-input"
                />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Frutilla"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Precio ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="600"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Stock Inicial</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="10"
                  className="form-input"
                />
              </div>
            </div>
            <button onClick={addNewProduct} className="save-product-btn">
              💾 Guardar Producto
            </button>
          </div>
        )}

        {/* Products Section */}
        {activeTab === 'products' && (
          <div className="stock-grid">
          {products.map((product) => (
            <div key={product.id} className="stock-card">
              {editingId === product.id ? (
                // Edit Mode
                <div className="edit-mode">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Emoji</label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        maxLength={2}
                        className="form-input emoji-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nombre</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Precio</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button onClick={() => saveEdit(product.id)} className="save-btn">
                      💾 Guardar
                    </button>
                    <button onClick={cancelEdit} className="cancel-btn">
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="stock-header">
                    <span className="stock-icon">{product.icon}</span>
                    <div>
                      <h3>{product.name}</h3>
                      <p className="stock-price">${product.price}</p>
                    </div>
                  </div>

                  <div className="stock-info">
                    <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : product.stock < 5 ? 'low-stock' : 'in-stock'}`}>
                      {product.stock === 0 ? 'Sin Stock' : product.stock < 5 ? 'Stock Bajo' : 'Disponible'}
                    </span>
                    <span className="stock-count">
                      {product.stock} unidades
                    </span>
                  </div>

                  <div className="stock-controls">
                    <button
                      onClick={() => updateStock(product.id, product.stock - 1)}
                      className="stock-btn decrease"
                      disabled={product.stock === 0}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                      className="stock-input"
                      min="0"
                    />
                    <button
                      onClick={() => updateStock(product.id, product.stock + 1)}
                      className="stock-btn increase"
                    >
                      +
                    </button>
                  </div>

                  <div className="product-actions">
                    <button onClick={() => startEdit(product)} className="edit-product-btn">
                      ✏️ Editar
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="delete-product-btn">
                      🗑️ Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        )}

        {/* Orders Section */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            {orders.length === 0 ? (
              <div className="no-orders">
                <span style={{ fontSize: '4rem' }}>📦</span>
                <h3>No hay pedidos aún</h3>
                <p>Los pedidos aparecerán aquí cuando los clientes los envíen</p>
              </div>
            ) : (
              <>
                {/* Pedidos de Hoy - Pendientes */}
                {orders.filter(o => o.status === 'pending' && isToday(o.timestamp)).length > 0 && (
                  <div className="orders-group">
                    <h3 className="orders-group-title">⏳ Pedidos Pendientes de Hoy</h3>
                    <div className="orders-grid">
                      {orders.filter(o => o.status === 'pending' && isToday(o.timestamp)).map(order => (
                        <div key={order.id} className="order-card pending">
                          <div className="order-header">
                            <div>
                              <div className="order-number">Pedido #{getOrderNumber(order)}</div>
                              <h4>{order.customerName}</h4>
                              <p className="order-date">
                                {new Date(order.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className="order-status pending-status">Pendiente</span>
                          </div>
                          
                          <div className="order-items">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="order-item">
                                <span>{item.icon} {item.name}</span>
                                <span>x{item.quantity}</span>
                                <span>${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="order-total">
                            <strong>Total:</strong>
                            <strong>${order.total}</strong>
                          </div>

                          <div className="order-actions">
                            <button 
                              onClick={() => confirmOrder(order)} 
                              className="confirm-order-btn"
                            >
                              ✅ Confirmar
                            </button>
                            <button 
                              onClick={() => rejectOrder(order)} 
                              className="reject-order-btn"
                            >
                              ❌ Rechazar
                            </button>
                            <button 
                              onClick={() => deleteOrder(order.id)} 
                              className="delete-order-btn"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedidos de Días Anteriores - Pendientes */}
                {orders.filter(o => o.status === 'pending' && !isToday(o.timestamp)).length > 0 && (
                  <div className="orders-group">
                    <h3 className="orders-group-title">📅 Pedidos Pendientes de Días Anteriores</h3>
                    <div className="orders-grid">
                      {orders.filter(o => o.status === 'pending' && !isToday(o.timestamp)).map(order => (
                        <div key={order.id} className="order-card pending old">
                          <div className="order-header">
                            <div>
                              <div className="order-number">Pedido #{getOrderNumber(order)}</div>
                              <h4>{order.customerName}</h4>
                              <p className="order-date">
                                {new Date(order.createdAt).toLocaleString('es-CL')}
                              </p>
                            </div>
                            <span className="order-status pending-status">Pendiente</span>
                          </div>
                          
                          <div className="order-items">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="order-item">
                                <span>{item.icon} {item.name}</span>
                                <span>x{item.quantity}</span>
                                <span>${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="order-total">
                            <strong>Total:</strong>
                            <strong>${order.total}</strong>
                          </div>

                          <div className="order-actions">
                            <button 
                              onClick={() => confirmOrder(order)} 
                              className="confirm-order-btn"
                            >
                              ✅ Confirmar
                            </button>
                            <button 
                              onClick={() => rejectOrder(order)} 
                              className="reject-order-btn"
                            >
                              ❌ Rechazar
                            </button>
                            <button 
                              onClick={() => deleteOrder(order.id)} 
                              className="delete-order-btn"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedidos Confirmados de Hoy */}
                {orders.filter(o => o.status === 'confirmed' && isToday(o.timestamp)).length > 0 && (
                  <div className="orders-group">
                    <h3 className="orders-group-title">✅ Confirmados Hoy</h3>
                    <div className="orders-grid">
                      {orders.filter(o => o.status === 'confirmed' && isToday(o.timestamp)).map(order => (
                        <div key={order.id} className="order-card confirmed">
                          <div className="order-header">
                            <div>
                              <div className="order-number">Pedido #{getOrderNumber(order)}</div>
                              <h4>{order.customerName}</h4>
                              <p className="order-date">
                                {new Date(order.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className="order-status confirmed-status">Confirmado</span>
                          </div>
                          
                          <div className="order-items">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="order-item">
                                <span>{item.icon} {item.name}</span>
                                <span>x{item.quantity}</span>
                                <span>${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="order-total">
                            <strong>Total:</strong>
                            <strong>${order.total}</strong>
                          </div>

                          <button 
                            onClick={() => deleteOrder(order.id)} 
                            className="delete-order-btn-solo"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedidos Confirmados de Días Anteriores */}
                {orders.filter(o => o.status === 'confirmed' && !isToday(o.timestamp)).length > 0 && (
                  <div className="orders-group">
                    <h3 className="orders-group-title">✅ Confirmados Anteriores</h3>
                    <div className="orders-grid">
                      {orders.filter(o => o.status === 'confirmed' && !isToday(o.timestamp)).map(order => (
                        <div key={order.id} className="order-card confirmed old">
                          <div className="order-header">
                            <div>
                              <div className="order-number">Pedido #{getOrderNumber(order)}</div>
                              <h4>{order.customerName}</h4>
                              <p className="order-date">
                                {new Date(order.createdAt).toLocaleString('es-CL')}
                              </p>
                            </div>
                            <span className="order-status confirmed-status">Confirmado</span>
                          </div>
                          
                          <div className="order-items">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="order-item">
                                <span>{item.icon} {item.name}</span>
                                <span>x{item.quantity}</span>
                                <span>${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="order-total">
                            <strong>Total:</strong>
                            <strong>${order.total}</strong>
                          </div>

                          <button 
                            onClick={() => deleteOrder(order.id)} 
                            className="delete-order-btn-solo"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedidos Rechazados */}
                {orders.filter(o => o.status === 'rejected').length > 0 && (
                  <div className="orders-group">
                    <h3 className="orders-group-title">❌ Pedidos Rechazados</h3>
                    <div className="orders-grid">
                      {orders.filter(o => o.status === 'rejected').map(order => (
                        <div key={order.id} className="order-card rejected">
                          <div className="order-header">
                            <div>
                              <div className="order-number">Pedido #{getOrderNumber(order)}</div>
                              <h4>{order.customerName}</h4>
                              <p className="order-date">
                                {new Date(order.createdAt).toLocaleString('es-CL')}
                              </p>
                            </div>
                            <span className="order-status rejected-status">Rechazado</span>
                          </div>
                          
                          <div className="order-items">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="order-item">
                                <span>{item.icon} {item.name}</span>
                                <span>x{item.quantity}</span>
                                <span>${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="order-total">
                            <strong>Total:</strong>
                            <strong>${order.total}</strong>
                          </div>

                          <button 
                            onClick={() => deleteOrder(order.id)} 
                            className="delete-order-btn-solo"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="admin-footer">
          <p>💡 Los cambios se guardan automáticamente y se reflejan en tiempo real para todos los clientes</p>
        </div>
      </div>
    </div>
  )
}

export default Admin
