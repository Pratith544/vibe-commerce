"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Plus, Minus, Loader2 } from "lucide-react"
import { cartAPI } from "@/lib/api"

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemove: (productId: number) => void
  onCheckout: () => void
  onRefresh: () => void
}

export default function Cart({ items, onUpdateQuantity, onRemove, onCheckout, onRefresh }: CartProps) {
  const [updating, setUpdating] = useState<number | null>(null)
  const [removing, setRemoving] = useState<number | null>(null)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = subtotal > 100 ? 0 : 5
  const total = subtotal + tax + shipping

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemove(productId)
      return
    }

    setUpdating(productId)
    try {
      await cartAPI.updateItem(productId, newQuantity)
      onUpdateQuantity(productId, newQuantity)
    } catch (err) {
      console.error("Error updating quantity:", err)
      alert(err instanceof Error ? err.message : "Failed to update quantity")
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (productId: number) => {
    setRemoving(productId)
    try {
      await cartAPI.removeItem(productId)
      onRemove(productId)
    } catch (err) {
      console.error("Error removing item:", err)
      alert(err instanceof Error ? err.message : "Failed to remove item")
    } finally {
      setRemoving(null)
    }
  }

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return

    try {
      await cartAPI.clearCart()
      onRefresh()
    } catch (err) {
      console.error("Error clearing cart:", err)
      alert(err instanceof Error ? err.message : "Failed to clear cart")
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-5xl">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some items to get started with your order</p>
        <Button variant="outline">Continue Shopping</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shopping Cart</h2>
            <p className="mt-2 text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.productId}
              className="flex items-center gap-4 p-4 border border-border hover:border-primary/50 transition-colors"
            >
              {/* Item Image */}
              <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground/30">{item.name.charAt(0)}</span>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-1">
                <button
                  onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                  disabled={updating === item.productId}
                  className="p-1 hover:bg-background rounded transition-colors disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  {updating === item.productId ? <Loader2 size={16} className="animate-spin" /> : <Minus size={16} />}
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                  disabled={updating === item.productId}
                  className="p-1 hover:bg-background rounded transition-colors disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  {updating === item.productId ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.productId)}
                disabled={removing === item.productId}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Remove item"
              >
                {removing === item.productId ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24 border border-border p-6 space-y-4">
          <h3 className="text-lg font-bold">Order Summary</h3>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            {shipping === 0 && <p className="text-xs text-primary">Free shipping on orders over $100!</p>}
          </div>

          <div className="border-t border-border pt-4 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
          </div>

          <Button onClick={onCheckout} className="w-full mt-6">
            Proceed to Checkout
          </Button>
        </Card>
      </div>
    </div>
  )
}
