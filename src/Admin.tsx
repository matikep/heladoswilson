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

const ADMIN_PASSWORD = 'wilsondeloswilsonitos2025' // Cambia esta contraseña

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
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
    const unsubscribe = onValue(stockRef, (snapshot) => {
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

    return () => unsubscribe()
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
            🔄 Resetear Todo el Stock
          </button>
          <a href="/" className="view-store-btn">
            👁️ Ver Tienda
          </a>
        </div>

        {/* Add New Product Form */}
        {showAddForm && (
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

        <div className="admin-footer">
          <p>💡 Los cambios se guardan automáticamente y se reflejan en tiempo real para todos los clientes</p>
        </div>
      </div>
    </div>
  )
}

export default Admin
