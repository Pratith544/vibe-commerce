const API_BASE_URL = "https://cart-backend-ashy.vercel.app/api"
const USER_ID = "user_12345"

export const apiClient = {
  async get(endpoint: string, params?: Record<string, any>) {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "user-id": USER_ID,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "API request failed")
    }

    return response.json()
  },

  async post(endpoint: string, body?: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-id": USER_ID,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "API request failed")
    }

    return response.json()
  },

  async put(endpoint: string, body?: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "user-id": USER_ID,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "API request failed")
    }

    return response.json()
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "user-id": USER_ID,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "API request failed")
    }

    return response.json()
  },
}

// Products API
export const productsAPI = {
  getAll(params?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    page?: number
    limit?: number
  }) {
    return apiClient.get("/products", params)
  },
  getById(id: number) {
    return apiClient.get(`/products/${id}`)
  },
}

// Cart API
export const cartAPI = {
  getCart() {
    return apiClient.get("/cart")
  },
  addItem(productId: number, quantity = 1) {
    return apiClient.post("/cart", { productId, quantity })
  },
  updateItem(productId: number, quantity: number) {
    return apiClient.put(`/cart/${productId}`, { quantity })
  },
  removeItem(productId: number) {
    return apiClient.delete(`/cart/${productId}`)
  },
  clearCart() {
    return apiClient.delete("/cart")
  },
}

// Checkout API
export const checkoutAPI = {
  checkout(cartItems: Array<{ productId: number; quantity: number }>) {
    return apiClient.post("/checkout", { cartItems })
  },
  getOrders(params?: { page?: number; limit?: number; status?: string }) {
    return apiClient.get("/checkout/orders", params)
  },
  getOrderById(orderId: string) {
    return apiClient.get(`/checkout/orders/${orderId}`)
  },
}
