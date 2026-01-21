"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { BiSearch, BiCalendar, BiBookOpen } from "react-icons/bi";
import { getAllBlogs } from "@/apis/blogApis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Blog {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  shortDescription?: string;
  createdAt: string;
}

export default function NewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: Number(searchParams.get("page")) || 1,
    totalPages: 0,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const itemsPerPage = 9;

  // Debounced search handler
  const debounceSearch = useCallback((value: string) => {
    setSearchTerm(value);

    if ((window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout);
    }

    (window as any).searchTimeout = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      updateURL(value, 1);
    }, 500);
  }, []);

  // Dummy data for demo
  const dummyBlogs: Blog[] = [
    {
      id: 1,
      title: "Die Zukunft der Orthopädieschuhtechnik",
      subtitle: "Innovative Technologien revolutionieren die Branche",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      shortDescription:
        "Erfahren Sie, wie moderne 3D-Scantechnologie und digitale Fertigung die Herstellung von Maßschuhen und Einlagen grundlegend verändern.",
      createdAt: "2024-01-20T10:30:00Z",
    },
    {
      id: 2,
      title: "Fußgesundheit im Winter",
      subtitle: "Tipps für die kalte Jahreszeit",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
      shortDescription:
        "Der Winter stellt besondere Anforderungen an unsere Füße. Wir zeigen Ihnen, wie Sie Ihre Füße optimal schützen und pflegen können.",
      createdAt: "2024-01-18T14:20:00Z",
    },
    {
      id: 3,
      title: "Einlagen richtig pflegen",
      subtitle: "So halten Ihre Einlagen länger",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800",
      shortDescription:
        "Die richtige Pflege Ihrer orthopädischen Einlagen verlängert deren Lebensdauer erheblich. Hier sind unsere Expertentipps.",
      createdAt: "2024-01-15T09:15:00Z",
    },
    {
      id: 4,
      title: "Diabetes und Fußgesundheit",
      subtitle: "Wichtige Informationen für Diabetiker",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
      shortDescription:
        "Menschen mit Diabetes müssen besonders auf ihre Füße achten. Wir erklären, worauf es ankommt und wie wir Sie unterstützen können.",
      createdAt: "2024-01-12T16:45:00Z",
    },
    {
      id: 5,
      title: "Kinderfüße richtig versorgen",
      subtitle: "Von Anfang an gesunde Füße",
      image:
        "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800",
      shortDescription:
        "Die Entwicklung von Kinderfüßen verläuft in verschiedenen Phasen. Erfahren Sie, wie Sie Ihr Kind optimal unterstützen können.",
      createdAt: "2024-01-10T11:00:00Z",
    },
    {
      id: 6,
      title: "Sportschuhe individuell anpassen",
      subtitle: "Maximale Leistung durch perfekte Passform",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      shortDescription:
        "Sportler profitieren besonders von individuell angepassten Schuhen. Wir zeigen die Möglichkeiten moderner Anpassungstechniken.",
      createdAt: "2024-01-08T13:30:00Z",
    },
    {
      id: 7,
      title: "Arbeitsschuhe mit Komfort",
      subtitle: "Den ganzen Tag bequem auf den Beinen",
      image:
        "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800",
      shortDescription:
        "Wer den ganzen Tag steht oder geht, braucht besondere Schuhe. Unsere Arbeitsschuhe vereinen Sicherheit, Komfort und Stil.",
      createdAt: "2024-01-05T10:15:00Z",
    },
    {
      id: 8,
      title: "Neue Materialien in der Schuhfertigung",
      subtitle: "Nachhaltigkeit trifft Innovation",
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800",
      shortDescription:
        "Moderne Materialien ermöglichen leichtere, atmungsaktivere und nachhaltigere Schuhe. Ein Blick auf die neuesten Entwicklungen.",
      createdAt: "2024-01-02T15:20:00Z",
    },
    {
      id: 9,
      title: "Häufige Fußprobleme und Lösungen",
      subtitle: "Wenn der Schuh drückt",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
      shortDescription:
        "Fersensporn, Hallux Valgus, Plattfuß - wir erklären die häufigsten Fußprobleme und zeigen wirksame Behandlungsmöglichkeiten.",
      createdAt: "2023-12-28T09:45:00Z",
    },
  ];

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API
      try {
        const result = await getAllBlogs({
          search: debouncedSearchTerm,
          page: pagination.currentPage,
          limit: itemsPerPage,
        });

        setBlogs(result.blogs);
        setPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          total: result.total,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPreviousPage,
        });
      } catch (apiError) {
        // Use dummy data for demo
        console.log("Using dummy data for demo");

        // Filter dummy data based on search
        const filtered = debouncedSearchTerm
          ? dummyBlogs.filter(
              (blog) =>
                blog.title
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase()) ||
                blog.subtitle
                  ?.toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase()),
            )
          : dummyBlogs;

        // Paginate dummy data
        const startIndex = (pagination.currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedBlogs = filtered.slice(startIndex, endIndex);

        setBlogs(paginatedBlogs);
        setPagination({
          currentPage: pagination.currentPage,
          totalPages: Math.ceil(filtered.length / itemsPerPage),
          total: filtered.length,
          hasNextPage: endIndex < filtered.length,
          hasPreviousPage: pagination.currentPage > 1,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch blogs:", error);
      setError(error.message);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Update URL
  function updateURL(search: string, page: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page > 1) params.set("page", page.toString());

    router.push(`?${params.toString() || ""}`, { scroll: false });
  }

  // Page change handler
  function changePage(newPage: number) {
    if (newPage === pagination.currentPage) return;
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    updateURL(searchTerm, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Navigate to blog detail
  const handleBlogClick = (blogId: number) => {
    router.push(`/dashboard/news/${blogId}`);
  };

  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";

    setSearchTerm(search);
    setDebouncedSearchTerm(search);
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchBlogs();
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if ((window as any).searchTimeout) {
        clearTimeout((window as any).searchTimeout);
      }
    };
  }, []);

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            News & Aktuelles
          </h1>
          <p className="text-gray-600">
            Aktuelle Nachrichten und Informationen
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
              placeholder="Artikel suchen..."
              value={searchTerm}
              onChange={(e) => debounceSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Fehler: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <BiBookOpen className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Keine Artikel gefunden
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Versuchen Sie andere Suchbegriffe"
                : "Noch keine Artikel verfügbar"}
            </p>
          </div>
        ) : (
          <>
            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {blogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white p-0"
                  onClick={() => handleBlogClick(blog.id)}
                >
                  {/* Blog Image */}
                  <div className="relative h-48 bg-gray-200">
                    {blog.image ? (
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <BiBookOpen className="text-gray-400" size={48} />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <BiCalendar size={16} />
                      <span>
                        {format(new Date(blog.createdAt), "dd.MM.yyyy")}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                      {blog.title}
                    </h3>

                    {/* Subtitle */}
                    {blog.subtitle && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {blog.subtitle}
                      </p>
                    )}

                    {/* Description */}
                    {blog.shortDescription && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {blog.shortDescription}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  size="sm"
                >
                  Zurück
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  )
                    .filter((page) => {
                      const current = pagination.currentPage;
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= current - 1 && page <= current + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Button
                          variant={
                            page === pagination.currentPage
                              ? "default"
                              : "outline"
                          }
                          onClick={() => changePage(page)}
                          size="sm"
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  size="sm"
                >
                  Weiter
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
