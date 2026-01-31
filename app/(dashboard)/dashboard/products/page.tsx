"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BiSearch, BiPackage, BiInfoCircle, BiSend } from "react-icons/bi";
import { getCategoriesProducts } from "@/apis/productsApis";
import { submitCustomerQuery } from "@/apis/customerQueryApis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  brand?: string;
  category?: string;
  price?: number;
  description?: string;
  image?: string;
  stock?: number;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Product detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Query dialog state
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryForm, setQueryForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    query: "",
  });

  // Dummy product data for demo
  const dummyProducts: Product[] = [
    {
      id: 1,
      name: "Comfort Walker Orthopädische Schuhe",
      brand: "OrthoComfort",
      category: "Orthopädieschuhe",
      price: 189.99,
      description:
        "Orthopädische Schuhe mit hervorragender Passform und Unterstützung. Ideal für den ganzen Tag. Mit anatomisch geformtem Fußbett und stoßdämpfender Sohle.",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
      stock: 12,
    },
    {
      id: 2,
      name: "Diabetiker Komfortschuhe",
      brand: "DiabCare",
      category: "Diabetikerschuhe",
      price: 229.99,
      description:
        "Speziell entwickelt für Diabetiker. Nahtlos verarbeitet, extra weiches Innenfutter, druckstellenfrei. Mit herausnehmbarem Fußbett für individuelle Einlagen.",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",
      stock: 8,
    },
    {
      id: 3,
      name: "Sportive Einlegesohlen Premium",
      brand: "ActiveSupport",
      category: "Einlagen",
      price: 89.99,
      description:
        "Hochwertige orthopädische Einlagen für sportliche Aktivitäten. Mit Längsgewölbestütze und Fersenpolster. Atmungsaktiv und antibakteriell.",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600",
      stock: 25,
    },
    {
      id: 4,
      name: "Business Comfort Herrenschuhe",
      brand: "ElegantWalk",
      category: "Business",
      price: 169.99,
      description:
        "Elegante Business-Schuhe mit orthopädischer Unterstützung. Echtleder, atmungsaktiv, mit Wechselfußbett. Perfekt für lange Arbeitstage im Büro.",
      image:
        "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600",
      stock: 15,
    },
    {
      id: 5,
      name: "Lady Comfort Damenschuhe",
      brand: "FemFit",
      category: "Damenschuhe",
      price: 159.99,
      description:
        "Stilvolle Damenschuhe mit orthopädischer Funktion. Weiches Leder, anatomisches Fußbett, moderate Absatzhöhe. Ideal für den Alltag.",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",
      stock: 18,
    },
    {
      id: 6,
      name: "Trekking Pro Wanderschuhe",
      brand: "MountainFit",
      category: "Wanderschuhe",
      price: 199.99,
      description:
        "Robuste Wanderschuhe mit orthopädischer Unterstützung. Wasserdicht, atmungsaktiv, mit stabiler Sohle. Perfekt für lange Wanderungen.",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
      stock: 10,
    },
    {
      id: 7,
      name: "Kinder Lernlaufschuhe",
      brand: "KidsFirst",
      category: "Kinderschuhe",
      price: 79.99,
      description:
        "Orthopädische Lernlaufschuhe für die ersten Schritte. Flexible Sohle, weiches Leder, atmungsaktiv. Unterstützt die natürliche Fußentwicklung.",
      image:
        "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600",
      stock: 20,
    },
    {
      id: 8,
      name: "Hallux Valgus Spezialschuhe",
      brand: "FootRelief",
      category: "Spezialschuhe",
      price: 179.99,
      description:
        "Speziell für Hallux Valgus entwickelt. Extra breite Zehenbox, weiches dehnbares Material, keine Druckstellen. Maximaler Komfort bei Ballenzehen.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      stock: 14,
    },
    {
      id: 9,
      name: "Fersensporn Relief Einlagen",
      brand: "HeelCare",
      category: "Einlagen",
      price: 69.99,
      description:
        "Spezielle Einlagen zur Entlastung bei Fersensporn. Mit Gelpolster im Fersenbereich, Längsgewölbestütze. Sofortige Schmerzlinderung.",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600",
      stock: 30,
    },
    {
      id: 10,
      name: "Winter Thermo Komfortschuhe",
      brand: "WarmWalk",
      category: "Winterschuhe",
      price: 149.99,
      description:
        "Warme Winterschuhe mit orthopädischem Fußbett. Gefüttert, wasserdicht, rutschfeste Sohle. Perfekt für kalte Tage.",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
      stock: 16,
    },
    {
      id: 11,
      name: "Senioren Komfortschuhe",
      brand: "SilverStep",
      category: "Seniorenschuhe",
      price: 139.99,
      description:
        "Extra bequeme Schuhe für Senioren. Leicht anzuziehen mit Klettverschluss, rutschfeste Sohle, herausnehmbares Fußbett. Maximale Sicherheit.",
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600",
      stock: 22,
    },
    {
      id: 12,
      name: "Sport Aktiveinlagen Carbon",
      brand: "ProSport",
      category: "Einlagen",
      price: 119.99,
      description:
        "High-End Sporteinlagen mit Carbon-Verstärkung. Maximale Energierückgabe, perfekte Dämpfung. Für Leistungssportler.",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600",
      stock: 18,
    },
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API
        try {
          const response = await getCategoriesProducts({ limit: 50 });

          // Extract products from categories if the response has that structure
          let productsData: Product[] = [];
          if (response.categories && Array.isArray(response.categories)) {
            response.categories.forEach((category: any) => {
              if (category.products && Array.isArray(category.products)) {
                productsData = [...productsData, ...category.products];
              }
            });
          } else if (response.products && Array.isArray(response.products)) {
            productsData = response.products;
          }

          // If API returns no products, use dummy data
          if (productsData.length === 0) {
            console.log("API returned no products, using dummy data for demo");
            setProducts(dummyProducts);
            setFilteredProducts(dummyProducts);
          } else {
            setProducts(productsData);
            setFilteredProducts(productsData);
          }
        } catch (apiError) {
          // Use dummy data for demo
          console.log("API failed, using dummy product data for demo");
          setProducts(dummyProducts);
          setFilteredProducts(dummyProducts);
        }
      } catch (error: any) {
        console.error("Failed to fetch products:", error);
        setError(error.message || "Failed to load products");
        setProducts(dummyProducts);
        setFilteredProducts(dummyProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  // Handle "More Info" button click
  const handleMoreInfoClick = () => {
    setDetailDialogOpen(false);
    setQueryDialogOpen(true);
  };

  // Handle query form submission
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !queryForm.customerName ||
      !queryForm.customerEmail ||
      !queryForm.query
    ) {
      toast.error("Bitte füllen Sie alle erforderlichen Felder aus");
      return;
    }

    try {
      setQueryLoading(true);

      await submitCustomerQuery({
        productId: selectedProduct?.id.toString(),
        productName: selectedProduct?.name,
        customerName: queryForm.customerName,
        customerEmail: queryForm.customerEmail,
        customerPhone: queryForm.customerPhone,
        query: queryForm.query,
        queryType: "product_inquiry",
      });

      toast.success(
        "Ihre Anfrage wurde erfolgreich übermittelt! Wir melden uns bald bei Ihnen.",
      );

      // Reset form
      setQueryForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        query: "",
      });
      setQueryDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error("Failed to submit query:", error);
      toast.error(
        error.message ||
          "Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Produktkatalog
          </h1>
          <p className="text-gray-600">
            Durchsuchen Sie unsere Produkte und stellen Sie Fragen
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <BiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Produkte suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <BiPackage className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Keine Produkte gefunden
            </h3>
            <p className="text-gray-500">Versuchen Sie andere Suchbegriffe</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white p-0"
                onClick={() => handleProductClick(product)}
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <BiPackage className="text-gray-400" size={48} />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-sm text-gray-500 mb-1">
                      {product.brand}
                    </p>
                  )}

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price and Stock */}
                  <div className="flex justify-between items-center">
                    {product.price && (
                      <span className="text-xl font-bold text-primary-600">
                        €{product.price.toFixed(2)}
                      </span>
                    )}
                    {product.stock !== undefined && (
                      <span
                        className={`text-sm ${product.stock > 0 ? "text-gray-600" : "text-red-600"}`}
                      >
                        {product.stock > 0
                          ? `${product.stock} verfügbar`
                          : "Nicht verfügbar"}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedProduct?.name}
            </DialogTitle>
            {selectedProduct?.brand && (
              <DialogDescription className="text-lg">
                {selectedProduct.brand}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Image */}
            <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
              {selectedProduct?.image ? (
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <BiPackage className="text-gray-400" size={64} />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              {selectedProduct?.category && (
                <div>
                  <span className="font-semibold text-gray-700">
                    Kategorie:{" "}
                  </span>
                  <span className="text-gray-600">
                    {selectedProduct.category}
                  </span>
                </div>
              )}

              {selectedProduct?.price && (
                <div>
                  <span className="font-semibold text-gray-700">Preis: </span>
                  <span className="text-2xl font-bold text-primary-600">
                    €{selectedProduct.price.toFixed(2)}
                  </span>
                </div>
              )}

              {selectedProduct?.stock !== undefined && (
                <div>
                  <span className="font-semibold text-gray-700">
                    Verfügbarkeit:{" "}
                  </span>
                  <span
                    className={
                      selectedProduct.stock > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {selectedProduct.stock > 0
                      ? `${selectedProduct.stock} Stück auf Lager`
                      : "Nicht verfügbar"}
                  </span>
                </div>
              )}

              {selectedProduct?.description && (
                <div>
                  <span className="font-semibold text-gray-700 block mb-2">
                    Beschreibung:
                  </span>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Schließen
            </Button>
            <Button onClick={handleMoreInfoClick} className="gap-2">
              <BiInfoCircle size={18} />
              Weitere Infos / Frage stellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Query Submission Dialog */}
      <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Frage zu diesem Produkt
            </DialogTitle>
            <DialogDescription>
              Haben Sie Fragen zu {selectedProduct?.name}? Senden Sie uns Ihre
              Anfrage und wir melden uns schnellstmöglich!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleQuerySubmit} className="space-y-4">
            {/* Customer Name */}
            <div>
              <Label htmlFor="customerName" className="mb-2 block">Ihr Name *</Label>
              <Input
                id="customerName"
                value={queryForm.customerName}
                onChange={(e) =>
                  setQueryForm({ ...queryForm, customerName: e.target.value })
                }
                placeholder="Name eingeben"
                required
              />
            </div>

            {/* Customer Email */}
            <div>
              <Label htmlFor="customerEmail" className="mb-2 block">Ihre E-Mail *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={queryForm.customerEmail}
                onChange={(e) =>
                  setQueryForm({ ...queryForm, customerEmail: e.target.value })
                }
                placeholder="E-Mail eingeben"
                required
              />
            </div>

            {/* Customer Phone */}
            <div>
              <Label htmlFor="customerPhone" className="mb-2 block">Telefonnummer (Optional)</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={queryForm.customerPhone}
                onChange={(e) =>
                  setQueryForm({ ...queryForm, customerPhone: e.target.value })
                }
                placeholder="Telefonnummer eingeben"
              />
            </div>

            {/* Query */}
            <div>
              <Label htmlFor="query" className="mb-2 block">Ihre Frage *</Label>
              <Textarea
                id="query"
                value={queryForm.query}
                onChange={(e) =>
                  setQueryForm({ ...queryForm, query: e.target.value })
                }
                placeholder="Was möchten Sie über dieses Produkt wissen?"
                rows={4}
                required
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQueryDialogOpen(false)}
                disabled={queryLoading}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={queryLoading} className="gap-2">
                {queryLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <BiSend size={18} />
                    Anfrage senden
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
