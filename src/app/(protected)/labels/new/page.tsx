// 📁 src/app/(protected)/labels/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { ArrowLeft, Save, Tag, Package, Layout } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  mainImage: string | null;
};

type Template = {
  id: string;
  name: string;
  width: number;
  height: number;
};

export default function NewLabelPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [paperSize, setPaperSize] = useState("A4");
  const [printQuantity, setPrintQuantity] = useState(1);
  const [includeQR, setIncludeQR] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  useEffect(() => {
    async function loadData() {
      const [productsRes, templatesRes] = await Promise.all([
        api.get<{ products: Product[] }>('/api/products?limit=100'),
        api.get<{ templates: Template[] }>('/api/templates?limit=100'),
      ]);
      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data.products);
      }
      if (templatesRes.success && templatesRes.data) {
        setTemplates(templatesRes.data.templates);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleSave() {
    if (!name || !selectedProduct || !selectedTemplate) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    const res = await api.post("/api/labels", {
      name,
      productId: selectedProduct,
      templateId: selectedTemplate,
      designData: {
        elements: [], // Will be populated in the editor
      },
      paperSize,
      printQuantity,
      includeQR,
    });
    setSaving(false);

    if (res.success) {
      router.push("/labels");
    } else {
      alert(res.message || "Failed to create label");
    }
  }

  if (loading) return <div className="text-gray-400 p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/labels"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} /> Back to Labels
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Label</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Label Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Premium Product Label"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`p-3 rounded-lg border-2 text-left transition ${
                  selectedProduct === product.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {product.mainImage ? (
                    <img src={product.mainImage} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <Package size={20} className="text-gray-400" />
                  )}
                  <span className="text-sm font-medium truncate">{product.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-3 rounded-lg border-2 text-left transition ${
                  selectedTemplate === template.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layout size={20} className="text-gray-400" />
                  <div>
                    <span className="text-sm font-medium block">{template.name}</span>
                    <span className="text-[10px] text-gray-400">
                      {template.width}×{template.height}mm
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Paper Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paper Size
          </label>
          <div className="flex gap-2">
            {['A4', 'LETTER', 'A3'].map(size => (
              <button
                key={size}
                onClick={() => setPaperSize(size)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  paperSize === size
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Print Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Print Quantity
          </label>
          <input
            type="number"
            value={printQuantity}
            onChange={(e) => setPrintQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            min={1}
            max={100}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Include QR Code */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={includeQR}
            onChange={(e) => setIncludeQR(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label className="text-sm text-gray-700">
            Include QR Code on label
          </label>
        </div>

        {/* Preview */}
        {(selectedProductData || selectedTemplateData) && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {selectedProductData && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Product:</span>
                  <span className="font-medium">{selectedProductData.name}</span>
                </div>
              )}
              {selectedTemplateData && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Template:</span>
                  <span className="font-medium">{selectedTemplateData.name}</span>
                  <span className="text-xs text-gray-400">
                    ({selectedTemplateData.width}×{selectedTemplateData.height}mm)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Paper:</span>
                <span className="font-medium">{paperSize}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Quantity:</span>
                <span className="font-medium">{printQuantity}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">QR Code:</span>
                <span className="font-medium">{includeQR ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            href="/labels"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !name || !selectedProduct || !selectedTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Save size={16} /> {saving ? "Creating..." : "Create Label"}
          </button>
        </div>
      </div>
    </div>
  );
}