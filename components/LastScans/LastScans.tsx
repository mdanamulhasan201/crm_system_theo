<<<<<<< HEAD
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import legsImg from '@/public/Kunden/legs.png'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAllCustomers } from '@/apis/customerApis';
import toast from 'react-hot-toast';
import LastScansShimmer from '@/components/ShimmerEffect/Customer/LastScansShimmer';

interface LastScan {
    id: number;
    vorname: string;
    nachname: string;
    createdAt: string;
    wohnort: string;
    customerNumber: string;
}

export interface LastScansRef {
    refreshData: () => void;
}

const LastScans = forwardRef<LastScansRef>((props, ref) => {
    const [lastScans, setLastScans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // Fetch customer data
    const fetchLastScans = React.useCallback(async (isRefresh: boolean = false) => {
        try {
            setIsLoading(true);
            const response = await getAllCustomers(1, 8);
            setLastScans(response.data);

            // No toast needed - just refresh silently

            // Mark initial load as complete after first fetch
            setIsInitialLoad(false);
        } catch (error) {
            console.error('Error fetching last scans:', error);
            if (isRefresh) {
                toast.error('Fehler beim Laden der Scandaten');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLastScans();
    }, [fetchLastScans]);

    // Expose refresh function to parent components
    useImperativeHandle(ref, () => ({
        refreshData: () => {
            // console.log('refreshData called - refreshing LastScans');
            fetchLastScans(true); // Pass true to indicate this is a refresh
        }
    }));


    const [emblaRef, emblaApi] = useEmblaCarousel({
        slidesToScroll: 1,
        align: 'start',
        breakpoints: {
            '(min-width: 640px)': { slidesToScroll: 1 },
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 3 },
            '(min-width: 1280px)': { slidesToScroll: 4 },
            '(min-width: 1536px)': { slidesToScroll: 5 }
        }
    })

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])



    // handle scan view function
    // const handleScanView = (id: number) => {
    //     setLoadingId(id);
    //     setTimeout(() => {
    //         router.push(`/dashboard/scanning-data/${id}`);
    //     }, 500);

    // }
    const handleScanView = (id: number) => {
        setLoadingId(id);
        setTimeout(() => {
            router.push(`/dashboard/scanning-data/${id}`);
        }, 500);

    }

    // date format
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }


    // handle kundeninfo view function customer-history/41d77415-edab-47dc-8849-136fd707064e
    const handleKundeninfoView = (id: string) => {
        router.push(`/dashboard/customer-history/${id}`);
    }

    // Show shimmer only on the initial load while data is being fetched
    if (isLoading && isInitialLoad) {
        return <LastScansShimmer />;
    }

    return (

        <div className='flex flex-col gap-4 mt-10'>
            <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold'>Ihre Letzten Scans</h1>
                {isLoading && (
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Aktualisiere...
                    </div>
                )}
            </div>
            {lastScans.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-gray-500'>
                    <div className='text-6xl mb-4'>📊</div>
                    <h2 className='text-xl font-semibold mb-2'>Keine Scandaten gefunden</h2>
                    <p className='text-center'>Es sind noch keine Scans verfügbar. Führen Sie Ihren ersten Scan durch, um Daten anzuzeigen.</p>
                </div>
            ) : (
                <div className='relative px-4'>
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                            {lastScans.map((scan: LastScan, index: number) => (
                                <div key={index} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] 2xl:flex-[0_0_20%] p-2 ">
                                    <div key={scan.id} className='border-2 border-gray-200 p-3 flex flex-col gap-2 h-[480px] overflow-hidden'>
                                        <div className='flex justify-center items-center'>
                                            <Image src={legsImg} alt='legs' className='w-48 h-48' />
                                        </div>
                                        <h2 className='text-lg capitalize font-semibold break-words'>
                                            {scan?.vorname} {scan?.nachname}
                                        </h2>
                                        <p>Kunden-ID: {scan?.customerNumber}</p>
                                        <p>Erstellt am: {formatDate(scan.createdAt)}</p>
                                        <div className='relative group'>
                                            <p className='truncate cursor-help'>
                                                Ort: {scan?.wohnort || 'N/A'}
                                            </p>
                                            {scan?.wohnort && (
                                                <div className='absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 max-w-xs p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg break-words'>
                                                    <div className='relative'>
                                                        <span className='font-semibold'>Ort: </span>
                                                        {scan.wohnort}
                                                        <div className='absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className='flex flex-col gap-2 z-50 mt-auto'>
                                            <button
                                                onClick={() => handleScanView(scan.id)}
                                                disabled={loadingId === scan.id}
                                                className='bg-[#62A07C] cursor-pointer hover:bg-[#62a07c98] transform duration-300 text-white px-4 py-1 rounded-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
                                            >
                                                {loadingId === scan.id ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Lädt...
                                                    </>
                                                ) : (
                                                    'Scan & Versorgung'
                                                )}
                                            </button>
                                            <button onClick={() => handleKundeninfoView(scan.id.toString())} className='bg-[#62A07C] hover:bg-[#62a07c98] transform duration-300 text-white px-4 py-1 rounded-md cursor-pointer'>Kundeninfo</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows - only show when there's data */}
                    <button
                        onClick={scrollPrev}
                        className="absolute cursor-pointer left-2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white p-2 transition-all duration-300 rounded-full shadow-lg hover:bg-gray-100 z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        onClick={scrollNext}
                        className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white transition-all duration-300 p-2 rounded-full shadow-lg hover:bg-gray-100 z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>
            )}
        </div>

    )
})

export default LastScans;
LastScans.displayName = 'LastScans';
=======
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import legsImg from "@/public/Kunden/legs.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAllCustomers } from "@/apis/customerApis";
import toast from "react-hot-toast";
import LastScansShimmer from "@/components/ShimmerEffect/Customer/LastScansShimmer";

interface LastScan {
  id: number;
  vorname: string;
  nachname: string;
  createdAt: string;
  wohnort: string;
  customerNumber: string;
}

export interface LastScansRef {
  refreshData: () => void;
}

const LastScans = forwardRef<LastScansRef>((props, ref) => {
  const [lastScans, setLastScans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Fetch customer data
  const fetchLastScans = React.useCallback(
    async (isRefresh: boolean = false) => {
      try {
        setIsLoading(true);
        const response = await getAllCustomers(1, 8);
        setLastScans(response.data);

        // No toast needed - just refresh silently

        // Mark initial load as complete after first fetch
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error fetching last scans:", error);
        if (isRefresh) {
          toast.error("Fehler beim Laden der Scandaten");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLastScans();
  }, [fetchLastScans]);

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      // console.log('refreshData called - refreshing LastScans');
      fetchLastScans(true); // Pass true to indicate this is a refresh
    },
  }));

  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    align: "start",
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 1 },
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
      "(min-width: 1280px)": { slidesToScroll: 4 },
      "(min-width: 1536px)": { slidesToScroll: 5 },
    },
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // handle scan view function
  // const handleScanView = (id: number) => {
  //     setLoadingId(id);
  //     setTimeout(() => {
  //         router.push(`/dashboard/scanning-data/${id}`);
  //     }, 500);

  // }
  const handleScanView = (id: number) => {
    setLoadingId(id);
    setTimeout(() => {
      router.push(`/dashboard/scanning-data/${id}`);
    }, 500);
  };

  // date format
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // handle kundeninfo view function customer-history/41d77415-edab-47dc-8849-136fd707064e
  const handleKundeninfoView = (id: string) => {
    router.push(`/dashboard/customer-history/${id}`);
  };

  // Show shimmer only on the initial load while data is being fetched
  if (isLoading && isInitialLoad) {
    return <LastScansShimmer />;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Scan History View</h1>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Aktualisiere...
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {lastScans.length * 125} Insoles found
        </div>
      </div>
      {lastScans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-32 h-32"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <p className="text-sm text-center">
            Geben Sie Suchkriterien ein, um
            <br />
            Kunden zu finden
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lastScans.map((scan: LastScan, index: number) => (
            <div
              key={scan.id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center items-center bg-gray-50 rounded-lg py-6">
                <Image
                  src={legsImg}
                  alt="legs"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="flex flex-col gap-2 flex-grow">
                <h2 className="text-base font-semibold capitalize truncate">
                  {scan?.vorname} {scan?.nachname}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <span className="text-xs">
                    Kunden-ID: {scan?.customerNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  <span className="text-xs">
                    Erstellt am: {formatDate(scan.createdAt)}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <span className="text-xs line-clamp-2">
                    Ort: {scan?.wohnort || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleScanView(scan.id)}
                  disabled={loadingId === scan.id}
                  className="bg-[#62A07C] hover:bg-[#62a07c98] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingId === scan.id ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Lädt...
                    </>
                  ) : (
                    "Scan ansehen"
                  )}
                </button>
                <button
                  onClick={() => handleKundeninfoView(scan.id.toString())}
                  className="text-[#62A07C] hover:text-[#4a8060] border border-[#62A07C] hover:border-[#4a8060] px-4 py-2 rounded-md text-center transition-colors cursor-pointer font-medium"
                >
                  Kundeninfo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default LastScans;
LastScans.displayName = "LastScans";
>>>>>>> 70f38c7 (updates)
