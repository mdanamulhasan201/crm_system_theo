'use client'
import { useEffect, useMemo, useState } from 'react';

export const useWeeklyCalendar = () => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [miniCalendarDate, setMiniCalendarDate] = useState<Date>(new Date());
    const [showYearMonthPicker, setShowYearMonthPicker] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isNavigating, setIsNavigating] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => {
            const isMobileView = window.innerWidth < 768;
            setIsMobile(isMobileView);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getTodayDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const weekStart = new Date(d);
        weekStart.setDate(diff);
        return weekStart;
    };

    const getWeekDates = () => {
        const weekStart = getWeekStart(currentDate);
        const dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const navigateWeek = async (direction: number) => {
        try {
            setIsNavigating(true);
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + (direction * 7));

            const today = getTodayDate();
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);

            if (newDate < oneYearAgo) {
                setIsNavigating(false);
                return;
            }

            setCurrentDate(newDate);
            setMiniCalendarDate(newDate);
            setTimeout(() => setIsNavigating(false), 100);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error navigating week:', error);
            setIsNavigating(false);
        }
    };

    const navigateMiniCalendarMonth = (direction: number) => {
        const newDate = new Date(miniCalendarDate);
        newDate.setMonth(miniCalendarDate.getMonth() + direction);
        setMiniCalendarDate(newDate);

        const firstDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        setCurrentDate(firstDayOfNewMonth);
    };

    const generateMiniCalendar = () => {
        const year = miniCalendarDate.getFullYear();
        const month = miniCalendarDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: Date[] = [];
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const handleYearMonthChange = (year: number, month: number) => {
        const newDate = new Date(year, month, 1);
        setMiniCalendarDate(newDate);
        setCurrentDate(newDate);
        setShowYearMonthPicker(false);
    };

    const handleMiniCalendarDateClick = (date: Date) => {
        setCurrentDate(date);
        const newMiniCalendarDate = new Date(date);
        setMiniCalendarDate(newMiniCalendarDate);
    };

    const weekDates = useMemo(() => getWeekDates(), [currentDate]);
    const miniCalendarDays = useMemo(() => generateMiniCalendar(), [miniCalendarDate]);
    const today = useMemo(getTodayDate, []);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dayNamesLong = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    const isPastDate = (date: Date) => {
        const t = getTodayDate();
        return date < t;
    };

    return {
        // state
        currentDate,
        miniCalendarDate,
        showYearMonthPicker,
        isMobile,
        isNavigating,

        // setters
        setShowYearMonthPicker,

        // navigation
        navigateWeek,
        navigateMiniCalendarMonth,
        handleYearMonthChange,
        handleMiniCalendarDateClick,

        // computed
        weekDates,
        miniCalendarDays,
        today,
        monthNames,
        dayNames,
        dayNamesLong,

        // utils
        isSameDay,
        isPastDate,
    };
};

export type UseWeeklyCalendarReturn = ReturnType<typeof useWeeklyCalendar>;


