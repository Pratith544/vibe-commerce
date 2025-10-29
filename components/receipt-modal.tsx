"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Download } from "lucide-react"

interface ReceiptModalProps {
  order: any
  onClose: () => void
}

export default function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground">Thank you for your purchase. Your order has been received.</p>
          </div>

         
          <div className="space-y-6 border-t border-border pt-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="font-mono font-bold text-lg">{order.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            
            <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold">{order.customerEmail}</p>
              </div>
            </div>

           
            <div>
              <h3 className="font-bold mb-3">Order Items</h3>
              <div className="space-y-2 border-t border-border pt-3">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${order.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary text-lg">${order.total?.toFixed(2)}</span>
              </div>
            </div>

           
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="font-semibold text-primary capitalize">{order.status || "Completed"}</p>
            </div>
          </div>

         
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2 bg-transparent">
              <Download size={18} />
              Print Receipt
            </Button>
            <Button onClick={onClose} className="flex-1">
              Continue Shopping
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
