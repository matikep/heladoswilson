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

const ADMIN_PASSWORD = 'helados2024' // Cambia esta contraseña

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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

  const updateStock = (productId: number, newStock: number) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
    )
    setProducts(updatedProducts)
    set(ref(database, 'stock'), updatedProducts)
  }

  const resetAllStock = () => {
    if (confirm('¿Resetear todo el stock a 10 unidades?')) {
      const resetProducts = products.map(p => ({ ...p, stock: 10 }))
      setProducts(resetProducts)
      set(ref(database, 'stock'), resetProducts)
    }
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
            <p>Gestión de Stock Diario</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>

        <div className="admin-actions">
          <button onClick={resetAllStock} className="reset-btn">
            🔄 Resetear Todo el Stock (10 unidades)
          </button>
          <a href="/" className="view-store-btn">
            👁️ Ver Tienda
          </a>
        </div>

        <div className="stock-grid">
          {products.map((product) => (
            <div key={product.id} className="stock-card">
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
