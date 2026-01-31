"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { BiArrowBack, BiCalendar, BiUser, BiShareAlt } from 'react-icons/bi'
import { getBlogById } from '@/apis/blogApis'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Blog {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  shortDescription?: string;
  completeDescription?: string;
  author?: string;
  tags?: string[];
  createdAt: string;
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        setError(null)

        const blogData = await getBlogById(params.id as string)
        setBlog(blogData)
      } catch (error: any) {
        console.error('Failed to fetch blog:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBlog()
    }
  }, [params.id])

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.shortDescription || blog.subtitle || '',
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link in Zwischenablage kopiert!')
    }
  }

  if (loading) {
    return (
      <div className="p-6 w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="p-6 w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-2xl text-red-600">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artikel nicht gefunden</h2>
          <p className="text-gray-600 mb-6">{error || 'Der gesuchte Artikel existiert nicht.'}</p>
          <Button onClick={() => router.push('/dashboard/news')}>
            <BiArrowBack className="mr-2" size={18} />
            Zurück zur Übersicht
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/news')}
            className="gap-2"
          >
            <BiArrowBack size={18} />
            Zurück zur Übersicht
          </Button>
        </div>

        {/* Article Card */}
        <Card className="overflow-hidden bg-white">
          {/* Featured Image */}
          {blog.image && (
            <div className="relative w-full h-96 overflow-hidden">
              <Image
                key={`blog-detail-${blog.id}-${Date.now()}`}
                src={`${blog.image}${blog.image.includes('?') ? '&' : '?'}t=${Date.now()}`}
                alt={blog.title}
                width={1200}
                height={600}
                className="w-full h-full object-cover"
                priority
                unoptimized
                onError={(e) => {
                  console.error(`Image failed to load for blog ${blog.id}:`, blog.image);
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="p-8">
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            {/* Subtitle */}
            {blog.subtitle && (
              <p className="text-xl text-gray-600 mb-6">
                {blog.subtitle}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 py-4 mb-6 border-t border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <BiCalendar size={20} />
                <span>{format(new Date(blog.createdAt), 'dd. MMMM yyyy')}</span>
              </div>
              {blog.author && (
                <div className="flex items-center gap-2 text-gray-600">
                  <BiUser size={20} />
                  <span>{blog.author}</span>
                </div>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors ml-auto"
              >
                <BiShareAlt size={20} />
                <span>Teilen</span>
              </button>
            </div>

            {/* Article Body */}
            {blog.completeDescription ? (
              <div
                className="prose max-w-none
                  prose-headings:text-gray-900
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:text-gray-700 prose-ul:my-4
                  prose-ol:text-gray-700 prose-ol:my-4
                  prose-li:mb-2
                  prose-img:rounded-lg prose-img:shadow-md prose-img:my-6"
                dangerouslySetInnerHTML={{ __html: blog.completeDescription }}
              />
            ) : blog.shortDescription ? (
              <div className="text-gray-700 text-lg leading-relaxed">
                {blog.shortDescription}
              </div>
            ) : (
              <p className="text-gray-500 italic">Kein Inhalt verfügbar.</p>
            )}
          </div>
        </Card>

        {/* Back Button (Bottom) */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push('/dashboard/news')}
            size="lg"
            className="gap-2"
          >
            <BiArrowBack size={20} />
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    </div>
  )
}
