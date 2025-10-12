"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface CustomCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CustomCalendar({ 
  selected, 
  onSelect, 
  disabled = false, 
  fromDate = new Date(),
  toDate = new Date(new Date().getFullYear() + 2, 11, 31)
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected?.getMonth() ?? new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(selected?.getFullYear() ?? new Date().getFullYear());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate years for dropdown
  const startYear = fromDate.getFullYear();
  const endYear = toDate.getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Get previous month's last days to fill the grid
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();

  // Define the calendar day type
  type CalendarDay = {
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
  };

  // Create calendar grid
  const calendarDays: CalendarDay[] = [];
  
  // Previous month's trailing days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(currentYear, currentMonth - 1, day);
    calendarDays.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: date < fromDate || date > toDate
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = date.getTime() === today.getTime();
    const isSelected = selected ? date.getTime() === selected.getTime() : false;
    const isDisabled = date < fromDate || date > toDate;

    calendarDays.push({
      date,
      day,
      isCurrentMonth: true,
      isToday,
      isSelected,
      isDisabled
    });
  }

  // Next month's leading days to complete the grid
  const remainingCells = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingCells && day <= 14; day++) {
    const date = new Date(currentYear, currentMonth + 1, day);
    calendarDays.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: date < fromDate || date > toDate
    });
  }

  const handleDateClick = (dayInfo: CalendarDay) => {
    if (disabled || dayInfo.isDisabled) return;
    onSelect?.(dayInfo.date);
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="p-4 bg-white">
      {/* Header with dropdowns and navigation */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          disabled={disabled}
          className="h-8 w-8 p-0 border-royal-navy/20 hover:border-gold-foil hover:bg-gold-foil/5"
        >
          <ChevronLeft className="h-4 w-4 text-royal-navy" />
        </Button>

        <div className="flex gap-2">
          <Select
            value={currentMonth.toString()}
            onValueChange={(value) => setCurrentMonth(parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 px-3 bg-white border-royal-navy/20 text-royal-navy font-inter text-sm hover:border-gold-foil focus:border-gold-foil focus:ring-2 focus:ring-gold-foil/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentYear.toString()}
            onValueChange={(value) => setCurrentYear(parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 px-3 bg-white border-royal-navy/20 text-royal-navy font-inter text-sm hover:border-gold-foil focus:border-gold-foil focus:ring-2 focus:ring-gold-foil/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          disabled={disabled}
          className="h-8 w-8 p-0 border-royal-navy/20 hover:border-gold-foil hover:bg-gold-foil/5"
        >
          <ChevronRight className="h-4 w-4 text-royal-navy" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="h-10 flex items-center justify-center text-slate-gray font-medium text-sm font-inter"
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(dayInfo)}
            disabled={disabled || dayInfo.isDisabled}
            className={`
              h-10 w-full flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 font-inter
              ${dayInfo.isCurrentMonth 
                ? 'text-royal-navy hover:bg-gold-foil/20 hover:border-gold-foil/30' 
                : 'text-slate-gray/40'
              }
              ${dayInfo.isSelected 
                ? 'bg-gold-foil text-white hover:bg-gold-foil border-gold-foil font-semibold shadow-sm' 
                : 'border border-transparent'
              }
              ${dayInfo.isToday && !dayInfo.isSelected 
                ? 'bg-royal-navy/10 text-royal-navy font-semibold border-royal-navy/30 ring-1 ring-royal-navy/20' 
                : ''
              }
              ${dayInfo.isDisabled 
                ? 'opacity-30 cursor-not-allowed hover:bg-transparent hover:border-transparent' 
                : 'cursor-pointer'
              }
            `}
          >
            {dayInfo.day}
          </button>
        ))}
      </div>
    </div>
  );
}