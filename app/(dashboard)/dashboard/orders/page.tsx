'use client'
import LineChartComponent from '@/components/OrdersPage/LineChart';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import HighPriorityCard from '@/components/OrdersPage/HighPriorityCard/HighPriorityCard';
import ProcessTable from '@/components/OrdersPage/ProccessTable/ProcessTable';
import { OrdersProvider } from '@/contexts/OrdersContext';
import { useRevenueOverview } from '@/hooks/orders/useRevenueOverview';
import AuftragssucheCard from '@/components/OrdersPage/AuftragssucheCard/AuftragssucheCard';

export default function Orders() {
    return (
        <OrdersProvider>
            <OrdersPageContent />
        </OrdersProvider>
    );
}

function OrdersPageContent() {
    const now = React.useMemo(() => new Date(), []);
    const [selectedMonth, setSelectedMonth] = React.useState<string>(String(now.getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = React.useState<string>(String(now.getFullYear()));
    const shouldFilter = selectedYear !== '' && selectedMonth !== '';
    const { data, processedChartData, loading, error, isRefetching } = useRevenueOverview(
        shouldFilter ? selectedYear : undefined,
        shouldFilter ? selectedMonth : undefined
    );

    const formatEuro = (amount: number) =>
        amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

    const months = React.useMemo(
        () => [
            { label: 'Januar', value: '01' },
            { label: 'Februar', value: '02' },
            { label: 'März', value: '03' },
            { label: 'April', value: '04' },
            { label: 'Mai', value: '05' },
            { label: 'Juni', value: '06' },
            { label: 'Juli', value: '07' },
            { label: 'August', value: '08' },
            { label: 'September', value: '09' },
            { label: 'Oktober', value: '10' },
            { label: 'November', value: '11' },
            { label: 'Dezember', value: '12' },
        ],
        []
    );
    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const list: number[] = [];
        for (let y = currentYear; y >= currentYear - 10; y--) list.push(y);
        return list;
    }, []);

    return (
        <div className='mb-20'>

            <div className='py-5 px-8 bg-white rounded-xl shadow'>
                <div className="text-2xl font-bold mb-5">Umsatzübersicht</div>

                {loading ? (
                    <div className="w-full h-64 flex items-center justify-center">
                        <div className="text-lg">Umsatzdaten werden geladen...</div>
                    </div>
                ) : error ? (
                    <div className="w-full h-64 flex items-center justify-center">
                        <div className="text-lg text-red-500">Error: {error}</div>
                    </div>
                ) : (
                    <>
                        <div className='flex flex-col xl:flex-row items-stretch w-full gap-6'>
                            {/* left side card  */}
                            <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-w-[250px] border mb-4 md:mb-0 xl:w-4/12">
                                <div className="text-2xl font-bold text-center mb-2">Geschäftsumsatz<br /></div>
                                <div className="text-4xl font-extrabold mt-4">
                                    {data?.statistics?.totalRevenue ? formatEuro(data.statistics.totalRevenue) : '-€'}
                                </div>
                            </div>

                            {/* right side line chart */}
                            <div className="w-full xl:w-8/12" >

                                <div className='flex flex-col items-end justify-end'>
                                    {/* filter need date and year wise  */}
                                    <div className="flex flex-col items-center justify-end">
                                        <div className="flex flex-col sm:flex-row gap-3 mb-2">
                                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                                <SelectTrigger className="w-[200px] cursor-pointer">
                                                    <SelectValue placeholder="Monat auswählen" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((m) => (
                                                        <SelectItem key={m.value} value={m.value} className='cursor-pointer'>
                                                            {m.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                <SelectTrigger className="w-[200px] cursor-pointer">
                                                    <SelectValue placeholder="Jahr auswählen" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((y) => (
                                                        <SelectItem key={y} value={String(y)} className='cursor-pointer'>{y}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="h-5 mb-2 text-xs text-gray-500">
                                            {isRefetching && <span>Updating…</span>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ minWidth: 0 }} className='overflow-x-auto'>
                                    <LineChartComponent chartData={processedChartData} />
                                </div>


                            </div>
                        </div>

                        <hr className='my-5 border-gray-200 border' />
                    </>
                )}

                {/* card bottom  */}
                <div className="flex flex-col md:flex-row justify-between items-stretch w-full gap-0">
                    {/* Einlagen in Produktion */}
                    <div className="flex-1 flex flex-col items-center justify-center  border-gray-300 py-6">
                        <div className="text-lg font-bold text-[#1E1F6D] mb-2 text-center">Einlagen in Produktion</div>
                        <div className="text-4xl font-extrabold">
                            {loading ? '…' : (error ? '-' : (data?.count ?? '-'))}
                        </div>
                    </div>
                    <div className='border-r border-gray-300 hidden md:block'></div>
                    {/* Ausgeführte Einlagen (letzten 30 Tage) */}
                    <div className="flex-1 flex flex-col items-center justify-center  border-gray-300 py-6">
                        <div className="text-lg font-bold text-[#62A07C] mb-2 text-center">Ausgeführte Einlagen<br /></div>
                        <div className="text-4xl font-extrabold">
                            {loading ? '…' : error ? '-' : (data?.totalPrice ? (data.totalPrice) : '-')}
                        </div>
                    </div>
                    <div className='border-r border-gray-300 mr-5 hidden md:block'></div>
                    {/* Auftragssuche */}
                    <AuftragssucheCard />
                </div>
            </div>
            {/* <HighPriorityCard /> */}

            <ProcessTable />
        </div>
    );
}
