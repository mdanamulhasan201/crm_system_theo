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
        const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // Adjust to start week on Monday
        const daysToSubtract = day === 0 ? 6 : day - 1; // If Sunday (0), go back 6 days, otherwise go back (day - 1)
        const diff = d.getDate() - daysToSubtract;
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
        // Adjust to start week on Monday (0 = Sunday, so we need to adjust)
        const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), go back 6 days, otherwise go back (dayOfWeek - 1)
        startDate.setDate(startDate.getDate() - daysToSubtract);

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
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    // dayNames: Display order (Monday first) for calendar grid headers
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    // dayNamesLong: JavaScript native order (Sunday=0, Monday=1, etc.) for getDay() access
    const dayNamesLong = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

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


