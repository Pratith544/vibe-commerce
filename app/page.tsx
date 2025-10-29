"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Moon, Sun, History } from "lucide-react"
import ProductGrid from "@/components/product-grid"
import Cart from "@/components/cart"
import Checkout from "@/components/checkout"
import OrderHistory from "@/components/order-history"
import OrderDetails from "@/components/order-details"
import { cartAPI } from "@/lib/api"

type ViewType = "shop" | "cart" | "checkout" | "orders" | "order-details"

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
}

export default function Home() {
  const [isDark, setIsDark] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>("shop")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
    fetchCart()
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (isDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark, mounted])

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart()
      if (response.data?.items) {
        setCartItems(response.data.items)
      }
    } catch (err) {
      console.error("Error fetching cart:", err)
    }
  }

  const toggleTheme = () => setIsDark(!isDark)

  const handleAddToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [
        ...prev,
        {
          productId: product.productId,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ]
    })
  }

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.productId !== productId))
    } else {
      setCartItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    }
  }

  const handleRemoveFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleCheckoutComplete = async () => {
    setCartItems([])
    setCurrentView("shop")
    await fetchCart()
  }

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setCurrentView("order-details")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                V
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Vibe Commerce</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setCurrentView(currentView === "orders" ? "shop" : "orders")}
                className="rounded-lg p-2 hover:bg-muted transition-colors"
                aria-label="View orders"
              >
                <History size={20} />
              </button>

              <button
                onClick={() => setCurrentView(currentView === "cart" ? "shop" : "cart")}
                className="relative rounded-lg p-2 hover:bg-muted transition-colors"
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {currentView === "shop" && <ProductGrid onAddToCart={handleAddToCart} />}

        {currentView === "cart" && (
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveFromCart}
            onCheckout={() => setCurrentView("checkout")}
            onRefresh={fetchCart}
          />
        )}

        {currentView === "checkout" && (
          <Checkout items={cartItems} onComplete={handleCheckoutComplete} onBack={() => setCurrentView("cart")} />
        )}

        {currentView === "orders" && <OrderHistory onViewOrder={handleViewOrder} />}

        {currentView === "order-details" && selectedOrderId && (
          <OrderDetails orderId={selectedOrderId} onBack={() => setCurrentView("orders")} />
        )}
      </main>
    </div>
  )
}
