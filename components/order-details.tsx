"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { checkoutAPI } from "@/lib/api"

interface OrderDetailsProps {
  orderId: string
  onBack: () => void
}

export default function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await checkoutAPI.getOrderById(orderId)
      setOrder(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div>
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error loading order</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card className="border border-border p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">{order.orderId}</h2>
              <p className="mt-2 text-muted-foreground">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-4">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground/30">{item.name.charAt(0)}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary">${item.subtotal}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border border-border p-6 space-y-4">
            <h3 className="text-lg font-bold">Order Summary</h3>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.pricing?.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.pricing?.tax}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.pricing?.shipping}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">${order.pricing?.total}</span>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-2">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                }`}
              >
                {order.status}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
