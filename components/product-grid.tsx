"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Loader2, Search, X } from "lucide-react"
import { productsAPI, cartAPI } from "@/lib/api"

interface Product {
  _id: string
  productId: number
  name: string
  description: string
  price: number
  category: string
  stock: number
  image?: string
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
  }, [search, category, minPrice, maxPrice, page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getAll({
        search: search || undefined,
        category: category || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
        limit: 12,
      })

      setProducts(response.data || [])
      setTotalPages(response.pages || 1)

      // Extract unique categories
      if (page === 1) {
        const uniqueCategories = [...new Set(response.data?.map((p: Product) => p.category))]
        setCategories(uniqueCategories as string[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.productId)
    try {
      await cartAPI.addItem(product.productId, 1)
      onAddToCart(product)
    } catch (err) {
      console.error("Error adding to cart:", err)
      alert(err instanceof Error ? err.message : "Failed to add to cart")
    } finally {
      setAddingToCart(null)
    }
  }

  const handleResetFilters = () => {
    setSearch("")
    setCategory("")
    setMinPrice("")
    setMaxPrice("")
    setPage(1)
  }

  if (error && products.length === 0) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p className="font-semibold">Error loading products</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
        <p className="mt-2 text-muted-foreground">Discover our curated collection of premium items</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 rounded-lg border border-border bg-muted/30 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          {(search || category || minPrice || maxPrice) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Min Price</label>
            <input
              type="number"
              placeholder="$0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Max Price</label>
            <input
              type="number"
              placeholder="$999"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product._id}
                className="group flex flex-col overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                {/* Product Image */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  {product.image ? (
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-muted-foreground/30">{product.name.charAt(0)}</div>
                        <p className="text-xs text-muted-foreground mt-2">{product.category}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || addingToCart === product.productId}
                    className="mt-4 w-full gap-2"
                  >
                    {addingToCart === product.productId ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
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

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your filters</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
