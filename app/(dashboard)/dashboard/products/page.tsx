"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BiSearch, BiPackage, BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { getAllShopProducts, ShopProduct } from "@/apis/shopProductsApis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cursor-based pagination state
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentCursor, setCurrentCursor] = useState<string>("");
  const productsPerPage = 12;

  // Fetch products with search and cursor-based pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllShopProducts({
          search: searchTerm,
          cursor: currentCursor,
          limit: productsPerPage,
        });

        setProducts(response.products);
        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
        setTotalProducts(response.total);
      } catch (error: any) {
        console.error("Failed to fetch shop products:", error);
        setError(error.message || "Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentCursor]);

  // Reset cursor when search term changes
  useEffect(() => {
    setCurrentCursor("");
  }, [searchTerm]);

  // Load next page
  const handleNextPage = () => {
    if (nextCursor) {
      setCurrentCursor(nextCursor);
    }
  };

  // Load previous page (reset to first page)
  const handlePreviousPage = () => {
    setCurrentCursor("");
  };

  // Handle product click - navigate to detail page
  const handleProductClick = (productId: string) => {
    router.push(`/dashboard/products/${productId}`);
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

        {/* Error State */}
        {error && (
          <div className="text-center py-10 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Fehler beim Laden
              </h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-gray-600">
            {totalProducts} {totalProducts === 1 ? 'Produkt' : 'Produkte'} gefunden
            {searchTerm && ` für "${searchTerm}"`}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <BiPackage className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Keine Produkte gefunden
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Versuchen Sie andere Suchbegriffe"
                : "Es sind noch keine Produkte verfügbar"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white p-0"
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
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
                    {/* Category */}
                    {product.category && (
                      <p className="text-sm text-gray-500 mb-1">
                        {product.category}
                      </p>
                    )}

                    {/* Product Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                      {product.title}
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
                      {product.quantity !== undefined && (
                        <span
                          className={`text-sm ${product.quantity > 0 ? "text-gray-600" : "text-red-600"}`}
                        >
                          {product.quantity > 0
                            ? `${product.quantity} verfügbar`
                            : "Nicht verfügbar"}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {(hasMore || currentCursor) && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={!currentCursor}
                  className="gap-2"
                >
                  <BiChevronLeft size={20} />
                  Zurück
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {currentCursor ? 'Seite 2+' : 'Seite 1'}
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="gap-2"
                >
                  Weiter
                  <BiChevronRight size={20} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
