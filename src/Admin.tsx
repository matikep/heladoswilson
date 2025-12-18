import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { database } from './firebase'
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

const ADMIN_PASSWORD = 'wilsondeloswilsonitos2025' // Cambia esta contraseña

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
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
      setLoading(false)
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
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      alert('Contraseña incorrecta')
      setPassword('')
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

  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <div className="login-header">
            <span className="login-icon">🔐</span>
            <h1>Panel de Administración</h1>
            <p>Helados Caseros</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              autoFocus
            />
            <button type="submit" className="login-btn">
              Ingresar
            </button>
          </form>
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
          <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
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
