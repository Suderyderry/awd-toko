import React, { useState } from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  Package,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
  Check,
  X,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Product, ProductStatus, ProductVariant } from '../../types/index.ts';
import { formatRupiah, isLowStock, isOutOfStock } from '../../utils/merchantLogic.ts';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    currentStore,
    addToast,
  } = useMerchant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formDiscountPrice, setFormDiscountPrice] = useState<number | undefined>(undefined);
  const [formStock, setFormStock] = useState<number>(10);
  const [formWeightGrams, setFormWeightGrams] = useState<number>(250);
  const [formSku, setFormSku] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<ProductStatus>('Active');
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormCategoryId(categories[0]?.id || 'cat_01');
    setFormPrice(25000);
    setFormDiscountPrice(undefined);
    setFormStock(20);
    setFormWeightGrams(300);
    setFormSku('PRD-' + Math.floor(1000 + Math.random() * 9000));
    setFormImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setFormStatus('Active');
    setFormVariants([]);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormCategoryId(p.categoryId);
    setFormPrice(p.price);
    setFormDiscountPrice(p.discountPrice);
    setFormStock(p.stock);
    setFormWeightGrams(p.weightGrams);
    setFormSku(p.sku);
    setFormImageUrl(p.imageUrl);
    setFormStatus(p.status);
    setFormVariants(p.variants && p.variants.length > 0 ? [...p.variants] : []);
    setIsModalOpen(true);
  };

  // Save form
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) {
      addToast('error', 'Form Tidak Lengkap', 'Nama produk dan harga wajib diisi.');
      return;
    }

    const catObj = categories.find((c) => c.id === formCategoryId);
    const categoryName = catObj ? catObj.name : 'Umum';
    const cleanVariants = formVariants.filter((v) => v.name.trim().length > 0);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName,
        description: formDescription,
        categoryId: formCategoryId,
        categoryName,
        price: formPrice,
        discountPrice: formDiscountPrice ? formDiscountPrice : undefined,
        stock: formStock,
        weightGrams: formWeightGrams,
        sku: formSku,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        status: formStock <= 0 ? 'OutOfStock' : formStatus,
        variants: cleanVariants.length > 0 ? cleanVariants : undefined,
      });
    } else {
      addProduct({
        storeId: currentStore.id,
        name: formName,
        description: formDescription,
        categoryId: formCategoryId,
        categoryName,
        price: formPrice,
        discountPrice: formDiscountPrice ? formDiscountPrice : undefined,
        stock: formStock,
        weightGrams: formWeightGrams,
        sku: formSku,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        status: formStock <= 0 ? 'OutOfStock' : formStatus,
        variants: cleanVariants.length > 0 ? cleanVariants : undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'SKU,Nama Produk,Kategori,Harga,Harga Diskon,Stok,Berat (g),Status\n';
    const rows = products
      .map(
        (p) =>
          `"${p.sku}","${p.name}","${p.categoryName}",${p.price},${p.discountPrice || ''},${p.stock},${p.weightGrams},"${p.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `awd_produk_${currentStore.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Ekspor Berhasil', 'Data produk berhasil diunduh dalam format CSV.');
  };

  // Import Mock CSV
  const handleImportCSV = () => {
    addToast('info', 'Import Produk', 'Template impor berhasil diverifikasi. 3 produk baru ditambahkan ke etalase.');
  };

  // Filter & Sort
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.categoryId !== selectedCategory) return false;
    if (selectedStatus === 'Active' && p.status !== 'Active') return false;
    if (selectedStatus === 'Inactive' && p.status !== 'Inactive') return false;
    if (selectedStatus === 'OutOfStock' && p.stock > 0 && p.status !== 'OutOfStock') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price') return (b.discountPrice || b.price) - (a.discountPrice || a.price);
    if (sortBy === 'stock') return b.stock - a.stock;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-3.5 pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">Daftar Produk</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {products.length} Menu
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atur etalase toko, harga diskon, foto produk, dan ketersediaan menu makanan Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleImportCSV}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor CSV</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-blue-600/25 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama produk atau SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Aktif</option>
            <option value="OutOfStock">Stok Habis</option>
            <option value="Inactive">Nonaktif</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="name">Urutkan: Nama</option>
            <option value="price">Urutkan: Harga Tertinggi</option>
            <option value="stock">Urutkan: Stok Terbanyak</option>
          </select>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedCategory === c.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-6">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tidak ada produk ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const hasDiscount = Boolean(p.discountPrice && p.discountPrice < p.price);
            const lowStock = isLowStock(p.stock);
            const outOfStock = isOutOfStock(p.stock);

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Stock Alert Badge */}
                    {outOfStock ? (
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                        Stok Habis
                      </span>
                    ) : lowStock ? (
                      <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Sisa {p.stock}
                      </span>
                    ) : (
                      <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Stok: {p.stock}
                      </span>
                    )}

                    {/* Discount Pill */}
                    {hasDiscount && (
                      <span className="absolute top-2.5 right-2.5 bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                        Diskon {Math.round(((p.price - p.discountPrice!) / p.price) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{p.categoryName}</span>
                      <span className="font-mono">SKU: {p.sku}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Price Block & Variant Badge */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {formatRupiah(p.discountPrice || p.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatRupiah(p.price)}
                          </span>
                        )}
                      </div>
                      {p.variants && p.variants.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                          {p.variants.length} Variasi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateProduct(p.id)}
                      title="Duplikasi Produk"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      title="Hapus Produk"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Ubah Menu</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingProduct ? 'Ubah Informasi Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 pt-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Produk / Menu *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Paket Ayam Geprek Spesial Sambal Bawang"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Lengkap
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan isi porsi, bahan, tingkat kepedasan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Menu
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Etalase
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProductStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Active">Aktif (Dijual)</option>
                    <option value="Inactive">Nonaktif</option>
                    <option value="OutOfStock">Stok Habis</option>
                  </select>
                </div>
              </div>

              {/* Price & Discount Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Harga Normal (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Harga Diskon (Opsional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formDiscountPrice || ''}
                    onChange={(e) =>
                      setFormDiscountPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="Kosongkan jika normal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock, Weight, SKU */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jumlah Stok
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Berat (Gram)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={formWeightGrams}
                    onChange={(e) => setFormWeightGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode SKU
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Variasi Menu / Produk (Porsi, Rasa, Topping, Level Pedas) */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                      Variasi Produk (Porsi, Rasa, Level Pedas)
                    </label>
                    <p className="text-[10px] text-slate-500">Tambahkan pilihan rasa atau varian harga khusus pelanggan</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormVariants([
                        ...formVariants,
                        {
                          id: 'var_' + Date.now(),
                          name: '',
                          price: formPrice,
                          stock: formStock,
                          sku: formSku ? `${formSku}-V${formVariants.length + 1}` : 'VAR-' + (formVariants.length + 1),
                        },
                      ])
                    }
                    className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-[11px] hover:bg-blue-100 border border-blue-200 dark:border-blue-800/60 transition-colors"
                  >
                    + Tambah Variasi
                  </button>
                </div>

                {formVariants.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-1">
                    Belum ada variasi. Produk dijual dengan satu pilihan standar.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {formVariants.map((v, idx) => (
                      <div key={v.id || idx} className="flex items-center gap-1.5 text-xs">
                        <input
                          type="text"
                          placeholder="Nama varian (misal: Pedas Manis / Jumbo)"
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...formVariants];
                            updated[idx].name = e.target.value;
                            setFormVariants(updated);
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="number"
                          placeholder="Harga Rp"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...formVariants];
                            updated[idx].price = Number(e.target.value);
                            setFormVariants(updated);
                          }}
                          className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="number"
                          placeholder="Stok"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...formVariants];
                            updated[idx].stock = Number(e.target.value);
                            setFormVariants(updated);
                          }}
                          className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setFormVariants(formVariants.filter((_, i) => i !== idx))}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                          title="Hapus Varian"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-bold shadow-md shadow-blue-600/25 transition-all"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Terbitkan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
