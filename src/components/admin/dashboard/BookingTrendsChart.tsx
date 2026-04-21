"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GET_WEEKLY_BOOKINGS } from "@/actions/dashboardActions";

const BookingTrendsChart = () => {
  const [data, setData] = useState<{ name: string; bookings: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [total, setTotal] = useState(0);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = Number(e.target.value);
    setYear(selectedYear);

    if (selectedYear === currentYear && month > currentMonth) {
      setMonth(currentMonth);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await GET_WEEKLY_BOOKINGS(year, month);
      if (res.success) {
        setData(res.data);
        setTotal(res.total);
      }
      setLoading(false);
    };

    fetchData();
  }, [month, year]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-gray-600 font-medium">Booking Trends</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-gray-900">{total}</span>
            <span className="text-sm text-green-500 font-medium flex items-center">
              +12.5%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Selected Month</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {months.map((m) => {
              const isFutureMonth = year === currentYear && m.value > currentMonth;
              
              return (
                <option 
                  key={m.value} 
                  value={m.value} 
                  disabled={isFutureMonth}
                  className={isFutureMonth ? "text-gray-300" : ""}
                >
                  {m.label}
                </option>
              );
            })}
          </select>
          <select
            value={year}
            onChange={handleYearChange}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f3f4f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#374151"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBookings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default BookingTrendsChart;