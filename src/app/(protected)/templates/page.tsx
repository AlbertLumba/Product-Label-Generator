// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/templates/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Palette, Edit, Trash2 } from 'lucide-react'
import { api } from '@/lib/api/client'

type Template = {
  id: string
  name: string
  description: string | null
  width: number
  height: number
  thumbnail: string | null
  isDefault: boolean
  _count: { labels: number }
  createdAt: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTemplates() {
    const res = await api.get<{ templates: Template[] }>('/api/templates')
    if (res.success && res.data) {
      setTemplates(res.data.templates)
    }
    setLoading(false)
  }

  useEffect(() => { fetchTemplates() }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await api.delete(`/api/templates/${id}`)
    fetchTemplates()
  }

  if (loading) return <div className="text-gray-400">Loading...</div>

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Design your label layouts</p>
        </div>
        <Link
          href="/templates/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Palette size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No templates yet</h3>
          <p className="text-gray-500 mb-4">Create your first label template</p>
          <Link
            href="/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus size={16} /> Create Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* Preview */}
              <Link href={`/templates/${template.id}`}>
                <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  {template.thumbnail ? (
                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <Palette size={48} className="text-gray-300" />
                  )}
                </div>
              </Link>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/templates/${template.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {template.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {template.width}mm × {template.height}mm
                    </p>
                  </div>
                  {template.isDefault && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Default</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{template._count.labels} labels</span>
                  <div className="flex gap-1">
                    <Link
                      href={`/templates/${template.id}`}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <Edit size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(template.id, template.name)}
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