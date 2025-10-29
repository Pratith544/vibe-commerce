"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, ChevronRight } from "lucide-react"
import { checkoutAPI } from "@/lib/api"

interface Order {
  _id: string
  orderId: string
  totalAmount: string
  totalItems: number
  status: string
  orderDate: string
  createdAt: string
}

interface OrderHistoryProps {
  onViewOrder: (orderId: string) => void
}

export default function OrderHistory({ onViewOrder }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchOrders()
  }, [page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await checkoutAPI.getOrders({ page, limit: 10 })
      setOrders(response.data || [])
      setTotalPages(response.pages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders")
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

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p className="font-semibold">Error loading orders</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-5xl">📦</div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground">Start shopping to see your order history</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
        <p className="mt-2 text-muted-foreground">View and manage your past orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order._id}
            className="border border-border p-6 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onViewOrder(order.orderId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-semibold text-lg">{order.orderId}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()} • {order.totalItems} items
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-primary">${Number.parseFloat(order.totalAmount).toFixed(2)}</p>
                <ChevronRight className="mt-2 ml-auto text-muted-foreground" size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-10 w-10 rounded-lg border transition-colors ${
                  page === p
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
