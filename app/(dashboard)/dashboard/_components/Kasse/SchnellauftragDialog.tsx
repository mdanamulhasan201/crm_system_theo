'use client'
import React, { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  Tag,
  ShoppingCart,
  User,
  UserPlus,
  Percent,
  Scan,
  LayoutGrid,
  PenLine,
  FileSearch,
} from 'lucide-react'
import BelegSuchenDialog from './BelegSuchenDialog'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductCategory = 'Einlagen' | 'Schuhe' | 'Socken' | 'Pflege' | 'Zubehör' | 'Freiverkauf'

interface Product {
  id: string
  name: string
  description: string
  price: number
  vatRate: number
  category: ProductCategory
  stock: number
}

interface CartItem {
  product: Product
  quantity: number
  discount: number // percentage 0–100
}

type ActivePosTab = 'auswaehlen' | 'scannen' | 'freiverkauf'

// ─── Dummy product data (replace with API later) ──────────────────────────────

const CATEGORIES: Array<'Alle' | ProductCategory> = [
  'Alle', 'Einlagen', 'Schuhe', 'Socken', 'Pflege', 'Zubehör', 'Freiverkauf',
]

const DUMMY_PRODUCTS: Product[] = [
  { id: 'p1',  name: 'Sporteinlagen Comfort',       description: 'Größe 42',          price:  95.00, vatRate:  4, category: 'Einlagen',  stock: 12 },
  { id: 'p2',  name: 'Sporteinlagen Premium',        description: 'Größe 38',          price: 129.00, vatRate:  4, category: 'Einlagen',  stock:  8 },
  { id: 'p3',  name: 'Diabetiker-Einlagen',          description: 'Größe 44',          price: 149.00, vatRate:  4, category: 'Einlagen',  stock:  5 },
  { id: 'p4',  name: 'Orthopädische Maßschuhe',      description: 'Schwarz, Gr. 43',   price: 389.00, vatRate:  4, category: 'Schuhe',    stock:  3 },
  { id: 'p5',  name: 'Therapieschuhe Leder',         description: 'Braun, Gr. 41',     price: 249.00, vatRate:  4, category: 'Schuhe',    stock:  6 },
  { id: 'p6',  name: 'Kompressionsstrümpfe Kl.2',    description: 'Schwarz, M',        price:  45.00, vatRate: 22, category: 'Socken',    stock: 24 },
  { id: 'p7',  name: 'Stützsocken Baumwolle',        description: 'Weiß, L',           price:  18.90, vatRate: 22, category: 'Socken',    stock: 30 },
  { id: 'p8',  name: 'Fußpflege-Set Deluxe',         description: '5-teilig',          price:  34.90, vatRate: 22, category: 'Pflege',    stock: 15 },
  { id: 'p9',  name: 'Lederpflegecreme',             description: '50 ml',             price:  12.90, vatRate: 22, category: 'Pflege',    stock: 40 },
  { id: 'p10', name: 'Einlegesohlen Gel',            description: 'Universal 36–46',   price:  19.90, vatRate: 22, category: 'Zubehör',   stock: 20 },
  { id: 'p11', name: 'Schuhspanner Holz',            description: 'Größe 40–45',       price:  29.90, vatRate: 22, category: 'Zubehör',   stock: 10 },
  { id: 'p12', name: 'Schuhpflegeset',               description: 'Komplett-Set',      price:  24.90, vatRate: 22, category: 'Zubehör',   stock:  8 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

// ─── Component ────────────────────────────────────────────────────────────────

interface SchnellauftragDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function SchnellauftragDialog({ isOpen, onClose }: SchnellauftragDialogProps) {
  // Beleg suchen
  const [isBelegSuchenOpen, setIsBelegSuchenOpen] = useState(false)

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [openDiscountId, setOpenDiscountId] = useState<string | null>(null)
  const [globalDiscountInput, setGlobalDiscountInput] = useState('')
  const [showGlobalDiscount, setShowGlobalDiscount] = useState(false)

  // Product selection
  const [activeTab, setActiveTab] = useState<ActivePosTab>('auswaehlen')
  const [activeCategory, setActiveCategory] = useState<'Alle' | ProductCategory>('Alle')
  const [searchQuery, setSearchQuery] = useState('')

  // Freiverkauf form
  const [freiName, setFreiName] = useState('')
  const [freiPrice, setFreiPrice] = useState('')
  const [freiVat, setFreiVat] = useState('22')
  const [freiMenge, setFreiMenge] = useState('1')

  // ── Filtered products ──────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    return DUMMY_PRODUCTS.filter(p => {
      if (activeCategory !== 'Alle' && p.category !== activeCategory) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      }
      return true
    })
  }, [activeCategory, searchQuery])

  // ── Cart operations ────────────────────────────────────────────────────────

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1, discount: 0 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId))
    if (openDiscountId === productId) setOpenDiscountId(null)
  }

  const applyItemDiscount = (productId: string, value: string) => {
    const discount = Math.min(100, Math.max(0, parseFloat(value) || 0))
    setCartItems(prev => prev.map(i => i.product.id === productId ? { ...i, discount } : i))
    setOpenDiscountId(null)
  }

  const addFreiverkauf = () => {
    const price = parseFloat(freiPrice.replace(',', '.'))
    const menge = Math.max(1, parseInt(freiMenge) || 1)
    if (!freiName.trim() || !price) return
    const product: Product = {
      id: `frei-${Date.now()}`,
      name: freiName.trim(),
      description: '',
      price,
      vatRate: parseInt(freiVat) || 22,
      category: 'Freiverkauf',
      stock: 999,
    }
    // Add with the requested quantity
    setCartItems(prev => [...prev, { product, quantity: menge, discount: 0 }])
    setFreiName('')
    setFreiPrice('')
    setFreiMenge('1')
  }

  // ── Totals ─────────────────────────────────────────────────────────────────

  const globalDiscount = parseFloat(globalDiscountInput.replace(',', '.')) || 0
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  const totals = cartItems.reduce(
    (acc, item) => {
      const lineGross = item.product.price * item.quantity * (1 - item.discount / 100)
      const afterGlobal = lineGross * (1 - globalDiscount / 100)
      const vatDecimal = item.product.vatRate / 100
      const lineNetto = afterGlobal / (1 + vatDecimal)
      return { gross: acc.gross + afterGlobal, netto: acc.netto + lineNetto, vat: acc.vat + (afterGlobal - lineNetto) }
    },
    { gross: 0, netto: 0, vat: 0 }
  )

  // ── Reset on close ─────────────────────────────────────────────────────────

  const handleClose = () => {
    onClose()
    // keep cart state — user may re-open
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[95vw] w-[95vw] h-[92vh] p-0 overflow-hidden flex flex-col gap-0">
        <DialogTitle className="sr-only">POS / Schnellverkauf</DialogTitle>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 shrink-0">
          <div className="w-8 h-8 bg-[#61A175] rounded-lg flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 leading-tight">POS / Schnellverkauf</h2>
            <p className="text-xs text-gray-400">Artikel scannen, auswählen oder manuell erfassen</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 px-3 text-sm shrink-0"
            onClick={() => setIsBelegSuchenOpen(true)}
          >
            <FileSearch className="w-4 h-4" />
            Beleg suchen
          </Button>
        </div>

        {/* ── Customer row ── */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 shrink-0">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Kunde suchen" className="pl-9 h-9 text-sm" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 px-3 text-sm">
            <UserPlus className="w-3.5 h-3.5" />
            Neu
          </Button>
          <span className="text-sm text-gray-400">oder</span>
          <Button variant="outline" size="sm" className="h-9 px-3 text-sm">
            Anonym
          </Button>
        </div>

        {/* ── Main: products (left) + cart (right) ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ────────── Left: product panel ────────── */}
          <div className="flex flex-col flex-1 overflow-hidden border-r border-gray-200">

            {/* Mode tabs */}
            <div className="px-4 py-2.5 border-b border-gray-100 shrink-0">
              <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5 w-fit">
                {([
                  { id: 'scannen',    label: 'Scannen',    icon: <Scan       className="w-3.5 h-3.5" /> },
                  { id: 'auswaehlen', label: 'Auswählen',  icon: <LayoutGrid className="w-3.5 h-3.5" /> },
                  { id: 'freiverkauf',label: 'Freiverkauf',icon: <PenLine    className="w-3.5 h-3.5" /> },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Freiverkauf form ── */}
            {activeTab === 'freiverkauf' && (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Freiverkauf / Manueller Artikel</h3>
                <div className="space-y-4 max-w-2xl">

                  {/* Artikelname */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Artikelname</label>
                    <Input
                      placeholder="z.B. Sonderanfertigung, Reparatur..."
                      value={freiName}
                      onChange={e => setFreiName(e.target.value)}
                    />
                  </div>

                  {/* Preis (Brutto) + MwSt */}
                  <div className="grid grid-cols-[1fr_160px] gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Preis (Brutto €)</label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0,00"
                        value={freiPrice}
                        onChange={e => setFreiPrice(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addFreiverkauf()}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">MwSt.</label>
                      <select
                        value={freiVat}
                        onChange={e => setFreiVat(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="4">4%</option>
                        <option value="10">10%</option>
                        <option value="22">22%</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Netto display */}
                  {freiPrice && parseFloat(freiPrice) > 0 && (() => {
                    const brutto = parseFloat(freiPrice) || 0
                    const vatDecimal = (parseInt(freiVat) || 22) / 100
                    const netto = brutto / (1 + vatDecimal)
                    const vatAmount = brutto - netto
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Netto</p>
                          <p className="text-sm font-semibold text-gray-900">{fmt(netto)} €</p>
                        </div>
                        <div className="text-gray-300 text-sm">+</div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">MwSt. {freiVat}%</p>
                          <p className="text-sm font-semibold text-gray-500">{fmt(vatAmount)} €</p>
                        </div>
                        <div className="text-gray-300 text-sm">=</div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Brutto</p>
                          <p className="text-sm font-bold text-[#61A175]">{fmt(brutto)} €</p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Menge + Hinzufügen on same row */}
                  <div className="flex items-end gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Menge</label>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={freiMenge}
                        onChange={e => setFreiMenge(e.target.value)}
                        className="w-20 h-10"
                      />
                    </div>
                    <Button
                      className="flex-1 h-10 bg-[#61A175] hover:bg-[#4f8a61] text-white font-semibold gap-2"
                      onClick={addFreiverkauf}
                      disabled={!freiName.trim() || !freiPrice || parseFloat(freiPrice) <= 0}
                    >
                      <Plus className="w-4 h-4" />
                      Hinzufügen
                    </Button>
                  </div>

                </div>
              </div>
            )}

            {/* ── Barcode scan mode ── */}
            {activeTab === 'scannen' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Scan className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-gray-700">Barcode Scanner bereit</p>
                  <p className="text-sm text-gray-400 mt-1">Scannen Sie einen Artikel-Barcode</p>
                </div>
                <Input
                  autoFocus
                  placeholder="Barcode scannen oder Artikelnummer eingeben…"
                  className="max-w-sm text-center"
                />
              </div>
            )}

            {/* ── Auswählen: product grid ── */}
            {activeTab === 'auswaehlen' && (
              <>
                {/* Search */}
                <div className="px-4 pt-3 pb-2 shrink-0">
                  <div className="relative">
                    <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Barcode scannen oder Artikel suchen…"
                      className="pl-9 pr-9 h-10"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Category pills */}
                <div className="flex items-center gap-2 px-4 pb-3 shrink-0 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === cat
                          ? 'bg-[#61A175] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Product grid */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {filteredProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                      Keine Artikel gefunden
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {filteredProducts.map(product => (
                        <button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-[#61A175] hover:shadow-sm transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#61A175]/30"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-8 h-8 bg-[#61A175]/10 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-[#61A175]" />
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full leading-tight">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mt-2 leading-tight">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{product.description}</p>
                          )}
                          <div className="flex items-end justify-between mt-3">
                            <span className="text-base font-bold text-gray-900">
                              {fmt(product.price)} €
                            </span>
                            <span className="text-xs text-gray-400">Lager: {product.stock}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ────────── Right: cart ────────── */}
          <div className="w-80 shrink-0 flex flex-col bg-white">

            {/* Cart header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
              <h3 className="text-sm font-semibold text-gray-900">Warenkorb</h3>
              <span className="text-sm text-gray-400">{totalItems} Artikel</span>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 px-4">
                  <Tag className="w-10 h-10 text-gray-200" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">Warenkorb ist leer</p>
                    <p className="text-xs text-gray-400 mt-0.5">Artikel scannen oder auswählen</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cartItems.map(item => {
                    const lineGross = item.product.price * item.quantity * (1 - item.discount / 100)
                    return (
                      <div key={item.product.id} className="px-4 py-3">
                        {/* Name + line total */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-gray-900 leading-tight">
                            {item.product.name}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 shrink-0">
                            {fmt(lineGross)} €
                          </span>
                        </div>
                        {/* Price breakdown */}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fmt(item.product.price)} € × {item.quantity} ({item.product.vatRate}% MwSt.)
                          {item.discount > 0 && (
                            <span className="text-[#61A175] ml-1">– {item.discount}% Rabatt</span>
                          )}
                        </p>
                        {/* Controls */}
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-sm font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          {/* Discount toggle */}
                          <button
                            onClick={() => setOpenDiscountId(openDiscountId === item.product.id ? null : item.product.id)}
                            className={`w-7 h-7 flex items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                              item.discount > 0
                                ? 'border-[#61A175] bg-[#61A175]/10 text-[#61A175]'
                                : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                            }`}
                          >
                            %
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-colors ml-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Inline discount input */}
                        {openDiscountId === item.product.id && (
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              className="h-7 text-xs w-20"
                              placeholder="0"
                              defaultValue={item.discount || ''}
                              autoFocus
                              onBlur={e => applyItemDiscount(item.product.id, e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') applyItemDiscount(item.product.id, (e.target as HTMLInputElement).value)
                                if (e.key === 'Escape') setOpenDiscountId(null)
                              }}
                            />
                            <span className="text-xs text-gray-500">% Rabatt</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Cart footer — totals + checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3 shrink-0 space-y-2.5">
                {/* Global discount */}
                {showGlobalDiscount ? (
                  <div className="flex items-center gap-2">
                    <Percent className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="h-7 text-xs flex-1"
                      placeholder="0"
                      value={globalDiscountInput}
                      onChange={e => setGlobalDiscountInput(e.target.value)}
                      autoFocus
                    />
                    <span className="text-xs text-gray-500 shrink-0">% Gesamt</span>
                    <button
                      onClick={() => { setShowGlobalDiscount(false); setGlobalDiscountInput('') }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowGlobalDiscount(true)}
                    className="flex items-center gap-1.5 text-xs text-[#61A175] hover:underline"
                  >
                    <Percent className="w-3 h-3" />
                    Gesamtrabatt hinzufügen
                  </button>
                )}

                {/* Totals */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Netto</span>
                    <span className="tabular-nums">{fmt(totals.netto)} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>MwSt.</span>
                    <span className="tabular-nums">{fmt(totals.vat)} €</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-1.5 border-t border-gray-100">
                    <span>Gesamt</span>
                    <span className="tabular-nums">{fmt(totals.gross)} €</span>
                  </div>
                </div>

                {/* Checkout */}
                <Button className="w-full h-10 bg-[#61A175] hover:bg-[#4f8a61] text-white font-semibold gap-2 mt-1">
                  <ShoppingCart className="w-4 h-4" />
                  Zur Kasse — {fmt(totals.gross)} €
                </Button>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>

    <BelegSuchenDialog
      isOpen={isBelegSuchenOpen}
      onClose={() => setIsBelegSuchenOpen(false)}
    />
    </>
  )
}
