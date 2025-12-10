'use client'
import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
    date: string;
    value: number;
}

interface BalanceVerlaufChartProps {
    data?: ChartDataPoint[];
}

// Sample data matching the design
const defaultData: ChartDataPoint[] = [
    { date: '23/03', value: 0.2 },
    { date: '24/03', value: 1.8 },
    { date: '25/03', value: 3.6 },
    { date: '26/03', value: 5.4 },
    { date: '27/03', value: 5.8 },
    { date: '28/03', value: 7.2 },
    { date: '29/03', value: 6.8 },
    { date: '30/03', value: 7.0 },
    { date: '31/03', value: 5.4 },
    { date: '01/04', value: 5.2 },
    { date: '02/04', value: 5.6 },
    { date: '03/04', value: 7.4 },
    { date: '04/04', value: 9.0 },
    { date: '05/04', value: 7.8 },
    { date: '06/04', value: 5.4 },
    { date: '07/04', value: 6.2 },
    { date: '08/04', value: 5.8 },
];

export default function BalanceVerlaufChart({ data = defaultData }: BalanceVerlaufChartProps) {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-emerald-600 font-bold">
                        {payload[0].value.toLocaleString('de-DE', { 
                            minimumFractionDigits: 1, 
                            maximumFractionDigits: 1 
                        })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Balance Verlauf</h2>
            
            <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            interval={0}
                            angle={0}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            domain={[0, 'dataMax + 1']}
                            tickFormatter={(value) => value.toFixed(1)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
