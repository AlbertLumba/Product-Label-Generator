// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/products/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Package, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api/client'

type Product = {
  id: string
  name: string
  slug: string
  sku: string | null
  price: string | null
  mainImage: string | null
  isActive: boolean
  createdAt: string
  category: { id: string; name: string; slug: string } | null
  _count: { labels: number }
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchProducts(page = 1) {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '10' })
    if (search) params.set('search', search)

    const res = await api.get<{ products: Product[]; pagination: Pagination }>(
      `/api/products?${params}`
    )
    
    if (res.success && res.data) {
      setProducts(res.data.products)
      setPagination(res.data.pagination)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchProducts(1)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    
    const res = await api.delete(`/api/products/${id}`)
    if (res.success) {
      fetchProducts(pagination.page)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} product{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Product</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Category</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">SKU</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Price</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Labels</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No products found</p>
                    <Link href="/products/new" className="text-sm text-indigo-600 hover:underline mt-1 inline-block">
                      Create your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.mainImage ? (
                          <img src={product.mainImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package size={18} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <Link href={`/products/${product.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                            {product.name}
                          </Link>
                          <p className="text-xs text-gray-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {product.sku || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.price ? `$${product.price}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product._count.labels}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                        product.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchProducts(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}