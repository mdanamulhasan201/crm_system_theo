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
    hasMore: false,
    nextCursor: null as string | null,
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


  // Fetch blogs
  const fetchBlogs = async (cursor: string | null = null) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllBlogs({
        search: debouncedSearchTerm,
        cursor: cursor,
        limit: itemsPerPage,
      });

      setBlogs(result.blogs);
      setPagination((prev) => ({
        ...prev,
        total: result.total,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        totalPages: Math.ceil(result.total / itemsPerPage),
      }));
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
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {blog.image ? (
                      <Image
                        key={`blog-card-${blog.id}-${Date.now()}`}
                        src={`${blog.image}${blog.image.includes('?') ? '&' : '?'}t=${Date.now()}`}
                        alt={blog.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={(e) => {
                          console.error(`Image failed to load for blog ${blog.id}:`, blog.image);
                        }}
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
                  disabled={pagination.currentPage === 1}
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
                  disabled={!pagination.hasMore}
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
