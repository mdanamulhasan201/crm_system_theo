"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { BiPackage, BiArrowBack, BiInfoCircle, BiSend } from "react-icons/bi";
import { getShopProductById, ShopProduct, addShopInterest } from "@/apis/shopProductsApis";
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interest dialog state
  const [interestDialogOpen, setInterestDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Detail page - Product ID from params:", productId);
        console.log("Detail page - Product ID type:", typeof productId);

        const productData = await getShopProductById(productId);
        console.log("Detail page - Product data received:", productData);
        setProduct(productData);
      } catch (error: any) {
        console.error("Detail page - Failed to fetch product:", error);
        console.error("Detail page - Error details:", error.message);
        setError(error.message || "Produkt konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    if (productId && productId !== 'undefined') {
      console.log("Detail page - Starting fetch for product ID:", productId);
      fetchProduct();
    } else {
      console.error("Detail page - Invalid product ID:", productId);
      setError("Ungültige Produkt-ID");
      setLoading(false);
    }
  }, [productId]);

  // Handle interest form submission
  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error("Bitte geben Sie Ihre Frage oder Ihr Interesse ein");
      return;
    }

    try {
      setSubmitting(true);

      await addShopInterest(productId, question.trim());

      toast.success(
        "Ihre Anfrage wurde erfolgreich übermittelt! Wir melden uns bald bei Ihnen."
      );

      // Reset form
      setQuestion("");
      setInterestDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to submit interest:", error);
      toast.error(
        error.message ||
          "Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 w-full bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 w-full bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
            className="mb-6 gap-2"
          >
            <BiArrowBack size={20} />
            Zurück zum Katalog
          </Button>

          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Fehler beim Laden
              </h3>
              <p className="text-red-600">{error || "Produkt nicht gefunden"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
          className="mb-6 gap-2"
        >
          <BiArrowBack size={20} />
          Zurück zum Katalog
        </Button>

        {/* Product Details Card */}
        <Card className="overflow-hidden bg-white">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Product Image */}
            <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <BiPackage className="text-gray-400" size={96} />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Category */}
              {product.category && (
                <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900">
                {product.title}
              </h1>

              {/* Price */}
              {product.price && (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary-600">
                    €{product.price.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Availability */}
              {product.quantity !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">
                    Verfügbarkeit:
                  </span>
                  <span
                    className={`font-medium ${
                      product.quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.quantity > 0
                      ? `${product.quantity} Stück auf Lager`
                      : "Nicht verfügbar"}
                  </span>
                </div>
              )}

              {/* Delivery Time */}
              {product.delivery_time && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">
                    Lieferzeit:
                  </span>
                  <span className="text-gray-600">{product.delivery_time}</span>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="pt-4 border-t">
                  <h2 className="font-semibold text-gray-700 mb-2">
                    Beschreibung:
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  onClick={() => setInterestDialogOpen(true)}
                  className="w-full gap-2"
                  size="lg"
                >
                  <BiInfoCircle size={20} />
                  Interesse bekunden / Frage stellen
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Interest Dialog */}
      <Dialog open={interestDialogOpen} onOpenChange={setInterestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Interesse bekunden</DialogTitle>
            <DialogDescription>
              Interessieren Sie sich für {product.title}? Senden Sie uns Ihre
              Anfrage oder Fragen und wir melden uns schnellstmöglich bei Ihnen!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInterestSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question" className="mb-2 block">
                Ihre Anfrage / Frage *
              </Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Teilen Sie uns Ihr Interesse mit oder stellen Sie Fragen zu diesem Produkt..."
                rows={6}
                required
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInterestDialogOpen(false)}
                disabled={submitting}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
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
