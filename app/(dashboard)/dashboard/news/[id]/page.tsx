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

  // Dummy blog data for demo
  const dummyBlogData: Record<string, Blog> = {
    "1": {
      id: 1,
      title: "Die Zukunft der Orthopädieschuhtechnik",
      subtitle: "Innovative Technologien revolutionieren die Branche",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      shortDescription: "Erfahren Sie, wie moderne 3D-Scantechnologie und digitale Fertigung die Herstellung von Maßschuhen und Einlagen grundlegend verändern.",
      completeDescription: `
        <h2>Die Revolution hat begonnen</h2>
        <p>Die Orthopädieschuhtechnik durchläuft derzeit eine der spannendsten Phasen ihrer Geschichte. Moderne 3D-Scantechnologie, digitale Fertigung und innovative Materialien verändern die Art und Weise, wie Maßschuhe und orthopädische Einlagen hergestellt werden, grundlegend.</p>

        <h3>3D-Scanning: Präzision auf höchstem Niveau</h3>
        <p>Mit hochauflösenden 3D-Scannern können wir heute die Form und Struktur des Fußes mit einer Genauigkeit erfassen, die vor wenigen Jahren noch undenkbar war. Jede Erhebung, jede Vertiefung wird millimetergenau dokumentiert. Dies ermöglicht eine Passform, die perfekt auf die individuellen Bedürfnisse zugeschnitten ist.</p>

        <h3>Digitale Fertigung: Von der Messung zum fertigen Produkt</h3>
        <p>Die erfassten Daten werden direkt in den Fertigungsprozess eingespeist. CNC-Fräsen und 3D-Drucker erstellen Leisten und Einlagen mit einer Präzision, die händisch nicht erreichbar wäre. Der gesamte Prozess ist dokumentiert und reproduzierbar.</p>

        <h3>Innovative Materialien</h3>
        <p>Neue Materialien bieten verbesserte Eigenschaften:</p>
        <ul>
          <li>Leichtere und gleichzeitig stabilere Konstruktionen</li>
          <li>Atmungsaktive Membranen für besseres Fußklima</li>
          <li>Nachhaltige und recycelbare Komponenten</li>
          <li>Antibakterielle Oberflächen für mehr Hygiene</li>
        </ul>

        <h3>Ausblick</h3>
        <p>Die Entwicklung geht weiter. Künstliche Intelligenz hilft bereits heute bei der Analyse von Gangbildern und der Optimierung von Schuhkonstruktionen. Sensoren in Schuhen können Belastungsmuster erfassen und Anpassungen vorschlagen. Die Zukunft der Orthopädieschuhtechnik ist digital, präzise und individueller denn je.</p>
      `,
      author: "Dr. Schmidt",
      tags: ["Technologie", "Innovation", "3D-Scan"],
      createdAt: "2024-01-20T10:30:00Z"
    },
    "2": {
      id: 2,
      title: "Fußgesundheit im Winter",
      subtitle: "Tipps für die kalte Jahreszeit",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
      shortDescription: "Der Winter stellt besondere Anforderungen an unsere Füße. Wir zeigen Ihnen, wie Sie Ihre Füße optimal schützen und pflegen können.",
      completeDescription: `
        <h2>Gesunde Füße auch bei Kälte</h2>
        <p>Die kalte Jahreszeit stellt unsere Füße vor besondere Herausforderungen. Kälte, Nässe und das Tragen von schwerem Schuhwerk können zu verschiedenen Problemen führen. Mit den richtigen Maßnahmen bleiben Ihre Füße aber auch im Winter gesund und warm.</p>

        <h3>Die richtige Schuhwahl</h3>
        <p>Winterschuhe sollten wasserdicht, atmungsaktiv und gut isoliert sein. Achten Sie auf:</p>
        <ul>
          <li>Ausreichend Platz für warme Socken</li>
          <li>Rutschfeste Sohlen mit gutem Profil</li>
          <li>Wasserdichte Materialien oder Imprägnierung</li>
          <li>Gute Isolierung ohne Hitzestau</li>
        </ul>

        <h3>Pflege im Winter</h3>
        <p>Ihre Füße brauchen im Winter besondere Aufmerksamkeit:</p>
        <ul>
          <li>Regelmäßiges Eincremen verhindert trockene, rissige Haut</li>
          <li>Fußbäder fördern die Durchblutung</li>
          <li>Wechseln Sie nasse Schuhe und Socken sofort</li>
          <li>Lüften Sie Ihre Schuhe täglich</li>
        </ul>

        <h3>Durchblutung fördern</h3>
        <p>Kalte Füße sind oft ein Zeichen schlechter Durchblutung. Helfen Sie nach:</p>
        <ul>
          <li>Fußgymnastik mehrmals täglich</li>
          <li>Wechselduschen regen die Durchblutung an</li>
          <li>Bewegung ist die beste Medizin</li>
          <li>Warme Fußbäder mit ätherischen Ölen</li>
        </ul>

        <p>Mit diesen Tipps kommen Sie und Ihre Füße gut durch den Winter!</p>
      `,
      author: "Anna Müller",
      tags: ["Pflege", "Winter", "Gesundheit"],
      createdAt: "2024-01-18T14:20:00Z"
    },
    "3": {
      id: 3,
      title: "Einlagen richtig pflegen",
      subtitle: "So halten Ihre Einlagen länger",
      image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800",
      shortDescription: "Die richtige Pflege Ihrer orthopädischen Einlagen verlängert deren Lebensdauer erheblich. Hier sind unsere Expertentipps.",
      completeDescription: `
        <h2>Langlebigkeit durch richtige Pflege</h2>
        <p>Orthopädische Einlagen sind präzise gefertigte Hilfsmittel, die täglich hohen Belastungen ausgesetzt sind. Mit der richtigen Pflege können Sie ihre Lebensdauer deutlich verlängern und ihre Wirksamkeit erhalten.</p>

        <h3>Tägliche Pflege</h3>
        <p>Nach jedem Tragen sollten Sie:</p>
        <ul>
          <li>Einlagen aus den Schuhen nehmen und auslüften lassen</li>
          <li>Mit einem trockenen Tuch abwischen</li>
          <li>Auf starke Geruchsbildung achten</li>
        </ul>

        <h3>Reinigung</h3>
        <p>Je nach Material unterscheidet sich die Reinigung:</p>
        <ul>
          <li><strong>Kunststoff-Einlagen:</strong> Mit lauwarmem Wasser und milder Seife reinigen</li>
          <li><strong>Leder-Einlagen:</strong> Nur feucht abwischen, spezielle Lederpflege verwenden</li>
          <li><strong>Textil-Bezüge:</strong> Meist waschbar, Herstellerangaben beachten</li>
        </ul>

        <h3>Wichtige Hinweise</h3>
        <ul>
          <li>Niemals in die Waschmaschine geben</li>
          <li>Nicht auf der Heizung oder in der Sonne trocknen</li>
          <li>Keine aggressiven Reinigungsmittel verwenden</li>
          <li>Bei Beschädigungen sofort zum Fachmann</li>
        </ul>

        <h3>Wann müssen Einlagen erneuert werden?</h3>
        <p>Auch bei guter Pflege haben Einlagen eine begrenzte Lebensdauer. Anzeichen für einen Wechsel:</p>
        <ul>
          <li>Sichtbare Abnutzung oder Verformung</li>
          <li>Nachlassende Stützwirkung</li>
          <li>Materialermüdung (Risse, Brüche)</li>
          <li>Veränderung der Fußform oder Beschwerden</li>
        </ul>

        <p>In der Regel sollten Einlagen alle 12-18 Monate erneuert werden.</p>
      `,
      author: "Thomas Weber",
      tags: ["Einlagen", "Pflege", "Ratgeber"],
      createdAt: "2024-01-15T09:15:00Z"
    }
  }

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch from API
        try {
          const blogData = await getBlogById(params.id as string)
          setBlog(blogData)
        } catch (apiError) {
          // Use dummy data for demo
          console.log('Using dummy blog data for demo')
          const dummyBlog = dummyBlogData[params.id as string]
          if (dummyBlog) {
            setBlog(dummyBlog)
          } else {
            throw new Error('Blog nicht gefunden')
          }
        }
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
            <div className="relative w-full h-96">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                priority
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
