import { useState, useEffect } from 'react'
import { ref, onValue, push, set } from 'firebase/database'
import { database } from './firebase'
import './App.css'

interface Product {
  id: number
  name: string
  price: number
  icon: string
  stock: number
}

interface CartItem extends Product {
  quantity: number
}

function App() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState('')
  const [showNameModal, setShowNameModal] = useState(false)

  // Cargar nombre desde localStorage al iniciar
  useEffect(() => {
    const savedName = localStorage.getItem('customerName')
    if (savedName) {
      setCustomerName(savedName)
    }
  }, [])

  useEffect(() => {
    // Escuchar cambios en el stock en tiempo real
    const stockRef = ref(database, 'stock')
    const unsubscribe = onValue(stockRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setProducts(data)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addToCart = (product: Product) => {
    // Verificar stock disponible
    const currentCartQuantity = cart.find(item => item.id === product.id)?.quantity || 0
    if (currentCartQuantity >= product.stock) {
      alert(`Lo sentimos, solo tenemos ${product.stock} unidades disponibles de ${product.name}`)
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prevCart.filter(item => item.id !== productId)
    })
  }

  const getQuantity = (productId: number): number => {
    const item = cart.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const getTotalPrice = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const generateWhatsAppMessage = (): string => {
    if (cart.length === 0) return ''
    
    let message = `Hola! Soy ${customerName}. Me gustaria hacer el siguiente pedido de Helados Caseros:\n\n`
    
    cart.forEach(item => {
      message += `- ${item.name} x${item.quantity} - $${item.price * item.quantity}\n`
    })
    
    message += `\nTotal: $${getTotalPrice()}\n\nGracias!`
    
    return encodeURIComponent(message)
  }

  const handleSendOrder = async () => {
    if (!customerName.trim()) {
      setShowNameModal(true)
      return
    }

    try {
      // Guardar pedido en Firebase
      const ordersRef = ref(database, 'orders')
      const newOrderRef = push(ordersRef)
      
      const orderData = {
        id: newOrderRef.key,
        customerName: customerName.trim(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          icon: item.icon,
          quantity: item.quantity
        })),
        total: getTotalPrice(),
        status: 'pending', // pending, confirmed, rejected
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
      }

      await set(newOrderRef, orderData)

      // Abrir WhatsApp
      const whatsappNumber = '56978084798'
      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`
      window.open(whatsappLink, '_blank')

      // Limpiar carrito
      setCart([])
      alert('¡Pedido enviado! Te contactaremos pronto por WhatsApp.')
    } catch (error) {
      console.error('Error al guardar el pedido:', error)
      alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.')
    }
  }

  const handleNameSubmit = () => {
    if (customerName.trim()) {
      // Guardar nombre en localStorage
      localStorage.setItem('customerName', customerName.trim())
      setShowNameModal(false)
      handleSendOrder()
    } else {
      alert('Por favor ingresa tu nombre')
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading-container">
            <span className="loading-icon">🍦</span>
            <p>Cargando helados...</p>
          </div>
        </div>
      </div>
    )
  }

  // Filtrar productos sin stock
  const availableProducts = products.filter(p => p.stock > 0)

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-decoration">
            <span className="ice-cream-icon">🍦</span>
            <span className="ice-cream-icon">🍨</span>
            <span className="ice-cream-icon">🍧</span>
            <span className="ice-cream-icon">🍦</span>
          </div>
          <h1 className="title">HELADOS CASEROS</h1>
          <p className="subtitle">Deliciosos helados artesanales</p>
        </header>

        {/* Products Grid */}
        {availableProducts.length > 0 ? (
          <div className="products-grid">
            {availableProducts.map(product => {
              const quantity = getQuantity(product.id)
              const canAddMore = quantity < product.stock
              
              return (
                <div
                  key={product.id}
                  className={`product-card ${quantity > 0 ? 'selected' : ''}`}
                >
                  <span className="product-icon">{product.icon}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price}</p>
                  
                  <div className="stock-indicator">
                    {product.stock < 5 && (
                      <span className="low-stock-badge">
                        ⚠️ Solo quedan {product.stock}
                      </span>
                    )}
                  </div>
                  
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => removeFromCart(product.id)}
                      disabled={quantity === 0}
                    >
                      −
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => addToCart(product)}
                      disabled={!canAddMore}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="no-stock-message">
            <span style={{ fontSize: '4rem' }}>😔</span>
            <h2>Lo sentimos</h2>
            <p>No tenemos helados disponibles en este momento.</p>
            <p>Por favor, vuelve más tarde.</p>
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <h2 className="cart-title">Tu Pedido</h2>
            
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <span className="cart-item-name">
                    {item.icon} {item.name}
                  </span>
                  <div className="cart-item-details">
                    <span>x{item.quantity}</span>
                    <span>${item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-amount">${getTotalPrice()}</span>
            </div>

            <button
              onClick={handleSendOrder}
              className="whatsapp-btn"
            >
              <span style={{ fontSize: '1.5rem' }}>💬</span>
              Enviar Pedido por WhatsApp
            </button>
          </div>
        )}

        {cart.length === 0 && availableProducts.length > 0 && (
          <div className="cart-summary">
            <p className="empty-cart">
              Selecciona tus helados favoritos para comenzar tu pedido 🍦
            </p>
          </div>
        )}

        {/* Name Modal */}
        {showNameModal && (
          <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>¿Cuál es tu nombre?</h2>
              <p>Para procesar tu pedido, necesitamos saber cómo te llamas</p>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="name-input"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
              <div className="modal-actions">
                <button onClick={handleNameSubmit} className="confirm-btn">
                  Continuar
                </button>
                <button onClick={() => setShowNameModal(false)} className="cancel-modal-btn">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <span className="footer-text">
            Helados hechos con amor ❤️… y azúcar 😎🍦
          </span>
        </footer>
      </div>
    </div>
  )
}

export default App
