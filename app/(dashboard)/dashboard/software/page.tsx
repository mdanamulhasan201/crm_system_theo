'use client'
import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaCarouselType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import shoes from '@/public/images/products/shoes.png'
import Image from 'next/image'
import ContactPage from '@/components/Contact/ContactPage'
import { getCategoriesProducts } from '@/apis/productsApis'
import FAQ from '../_components/Software/FAQ'
import VersionPage from '../_components/Software/Version'
import RelesHistory from '../_components/Software/RelesHistory'
import VideosTutorial from '../_components/Software/VideosTutorial'
import Hotline from '../_components/Software/Hotline'

interface Color {
    id: string;
    colorName: string;
    colorCode: string;
    images: {
        id: string;
        url: string;
    }[];
}

interface Product {
    id: string;
    name: string;
    Category: string;
    Sub_Category: string;
    price: number | null;
    offer: number;
    availability: boolean;
    colors: Color[];
}

interface CategoryData {
    name: string;
    totalProducts: number;
    products: Product[];
}

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => (
    <div className="p-4 h-full flex flex-col">
        <div className="bg-gray-200 h-32 rounded-lg mb-3 flex items-center justify-center">
            <Image
                src={product.colors[0]?.images[0]?.url || shoes}
                alt={product.name}
                width={200}
                height={200}
                className=" object-cover w-full h-full object-center rounded"
            />
        </div>
        <div className="flex-grow">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-gray-600 text-xs mb-1">
                {product.Sub_Category !== "null" ? product.Sub_Category : product.Category}
            </p>
        </div>
        <button className="w-full mt-2 border border-gray-600 text-xs py-1 px-2 rounded transition-colors uppercase">
            Jetzt hinzufügen
        </button>
    </div>
);

const InnerCarousel = ({ products, category }: { products: Product[], category: string }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(max-width: 767px)': { slidesToScroll: 1 }
        },
        containScroll: 'trimSnaps'
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-96 relative">
            <h2 className="text-lg font-bold text-center mb-4 uppercase">{category}</h2>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {products.map((product: Product) => (
                        <div key={product.id}
                            className="flex-none w-full md:w-1/2 px-2">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Inner Carousel Navigation Buttons */}
            <button
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10 ${!prevBtnEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10 ${!nextBtnEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

// Main Carousel Component
const MainCarousel = ({ categories }: { categories: CategoryData[] }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 1024px)': { slidesToScroll: 3 },
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(max-width: 767px)': { slidesToScroll: 1 }
        },
        containScroll: 'trimSnaps'
    }, [Autoplay()]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollTo = useCallback(
        (index: number) => emblaApi && emblaApi.scrollTo(index),
        [emblaApi]
    );

    const onInit = useCallback((emblaApi: EmblaCarouselType) => {
        setScrollSnaps(emblaApi.scrollSnapList());
    }, []);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onInit(emblaApi);
        onSelect(emblaApi);
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onInit);
    }, [emblaApi, onInit, onSelect]);

    return (
        <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {categories.map((category) => (
                        <div key={category.name}
                            className="flex-none w-full md:w-1/2 lg:w-1/3 px-2">
                            <InnerCarousel
                                products={category.products}
                                category={category.name.toUpperCase()}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${index === selectedIndex
                            ? 'bg-[#61A07B] w-4'
                            : 'bg-gray-300'
                            }`}
                        onClick={() => scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default function Software() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getCategoriesProducts();
                setCategories(data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    return (
        <div className="">
            <h1 className='text-4xl font-bold capitalize text-center mb-10'>Support & Updates</h1>
            <div className='flex flex-col gap-6'>
                <FAQ />
                <VersionPage />
                <RelesHistory />
                <VideosTutorial />
            </div>
            {/* <div className='flex flex-col gap-6 mb-8'>
                <h1 className='text-2xl font-bold uppercase'>NEUERUNGEN</h1>
                <p className='text-sm text-gray-700 leading-8'>
                    Willkommen bei der FeetF1rst Software – Ihre neue Schaltzentrale für eine perfekte Fußversorgung!
                    Mit großer Freude präsentieren wir Ihnen die erste Version unserer FeetF1rst Software. Unser Ziel war und ist es, eine Plattform zu schaffen, die Ihnen alles an die Hand gibt, was Sie für die individuelle und professionelle Fußversorgung benötigen – von der 3D-Fußanalyse über die passgenaue Produktempfehlung bis hin zur Verwaltung Ihrer Kundendaten.
                    Da es sich um die erste Version handelt, möchten wir offen und ehrlich mit Ihnen sein: Es können noch kleinere Fehler auftreten. Diese sind uns bewusst und werden bereits mit höchster Priorität bearbeitet....
                    {showMore && (
                        <>
                            Unser Entwicklerteam arbeitet täglich daran, die Stabilität, Geschwindigkeit und Benutzerfreundlichkeit der Software weiter zu verbessern, damit Ihre Arbeit noch reibungsloser wird.
                            Gleichzeitig haben wir schon viele neue Funktionen in der Pipeline, die Ihre Arbeit noch komfortabler gestalten werden. Dazu gehören unter anderem erweiterte Auswertungsmöglichkeiten, noch präzisere Produktempfehlungen basierend auf individuellen Fußprofilen sowie zusätzliche Services für eine rundum abgestimmte Fußversorgung. Diese Erweiterungen befinden sich derzeit in intensiver Entwicklung und werden Schritt für Schritt ausgerollt – wir bitten hier noch um etwas Geduld.
                            Mit der FeetF1rst Software gehen wir gemeinsam einen wichtigen Schritt in Richtung Zukunft: hin zu einer Versorgung, die individuell, effizient und nachhaltig ist. Danke, dass Sie Teil dieser Reise sind. Wir freuen uns darauf, gemeinsam mit Ihnen die Fußgesundheit auf ein neues Level zu heben!
                        </>
                    )}
                </p>

                <div className='flex justify-center mt-5'>
                    <button onClick={toggleShowMore} className='border border-gray-600 text-gray-600 px-8 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition-colors'>
                        {showMore ? 'WENIGER ANZEIGEN' : 'MEHR ANZEIGEN'}
                    </button>
                </div>
            </div> */}

            {/* Carousel Section */}
            <div className="mt-14">
                {/* <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold uppercase mb-5">JETZT NEU IM SHOE FINDER FEETFIRST</h2>
                </div> */}
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    <MainCarousel categories={categories} />
                )}
            </div>

            {/* contact form */}
            <ContactPage />

            <Hotline />


            {/* footer */}
            {/* <div className='bg-[#121212] text-white p-4 mt-14 flex items-center gap-2'>
                <div className='flex items-center gap-5'>
                    <div className='border border-white rounded-full p-1'>
                        <IoIosCall className='text-2xl' />
                    </div>
                    <div>
                        <p className='text-sm text-white capitalize'>WIR WERDEN UNS SCHNELLSTMÖGLICH DARUM KÜMMERN!</p>
                        <p className='text-sm text-white capitalize'>ALTERNATIV ERREICHEN SIE UNS JEDERZEIT UNTER +39 366 508 7742</p>
                    </div>
                </div>
            </div> */}
        </div>
    )
}