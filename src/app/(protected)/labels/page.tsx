// 📁 src/app/(protected)/labels/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Tag, Edit, Trash2, QrCode, Eye } from 'lucide-react'
import { api } from '@/lib/api/client'

type Label = {
  id: string
  name: string
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  printQuantity: number
  paperSize: string
  thumbnail: string | null
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    mainImage: string | null
  }
  template: {
    id: string
    name: string
  }
}

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')

  async function fetchLabels() {
    const url = statusFilter 
      ? `/api/labels?status=${statusFilter}` 
      : '/api/labels'
    const res = await api.get<{ labels: Label[] }>(url)
    if (res.success && res.data) {
      setLabels(res.data.labels)
    }
    setLoading(false)
  }

  useEffect(() => { fetchLabels() }, [statusFilter])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Archive "${name}"?`)) return
    await api.delete(`/api/labels/${id}`)
    fetchLabels()
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      ACTIVE: 'bg-green-50 text-green-700 border-green-200',
      ARCHIVED: 'bg-gray-50 text-gray-500 border-gray-200',
    }
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[status] || ''}`}>
        {status}
      </span>
    )
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labels</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product labels</p>
        </div>
        <Link
          href="/labels/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> New Label
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['', 'DRAFT', 'ACTIVE', 'ARCHIVED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              statusFilter === status
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {labels.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No labels yet</h3>
          <p className="text-gray-500 mb-4">Create your first product label</p>
          <Link
            href="/labels/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus size={16} /> Create Label
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {labels.map(label => (
            <div key={label.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* Preview */}
              <Link href={`/labels/${label.id}`}>
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  {label.thumbnail ? (
                    <img src={label.thumbnail} alt={label.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Tag size={40} className="mx-auto mb-2" />
                      <span className="text-xs">{label.paperSize} • {label.printQuantity}pc</span>
                    </div>
                  )}
                </div>
              </Link>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/labels/${label.id}`} className="font-medium text-gray-900 hover:text-indigo-600 block truncate">
                      {label.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {label.product.name} • {label.template.name}
                    </p>
                  </div>
                  {statusBadge(label.status)}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{label.paperSize}</span>
                    <span>×{label.printQuantity}</span>
                  </div>
                  <div className="flex gap-1">
                    <Link
                      href={`/labels/${label.id}`}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <Edit size={14} />
                    </Link>
                    {label.status === 'ACTIVE' && (
                      <Link
                        href={`/p/${label.product.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Eye size={14} />
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(label.id, label.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}