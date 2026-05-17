export type CalendarDate = {
  year: number;
  monthIndex: number;
  day: number;
};

export type MonthView = {
  year: number;
  monthIndex: number;
  cells: (number | null)[];
};

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

export function getToday(): CalendarDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
    day: now.getDate(),
  };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function buildMonthGrid(year: number, monthIndex: number): (number | null)[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const totalDays = daysInMonth(year, monthIndex);
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    cells.push(day);
  }

  return cells;
}

export function getMonthView(year: number, monthIndex: number): MonthView {
  return {
    year,
    monthIndex,
    cells: buildMonthGrid(year, monthIndex),
  };
}

export function addMonths(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const date = new Date(year, monthIndex + delta, 1);
  return {
    year: date.getFullYear(),
    monthIndex: date.getMonth(),
  };
}

export function previousMonth(year: number, monthIndex: number) {
  return addMonths(year, monthIndex, -1);
}

export function nextMonth(year: number, monthIndex: number) {
  return addMonths(year, monthIndex, 1);
}

export function formatMonthLabel(monthIndex: number, locale = "default"): string {
  return new Date(2000, monthIndex, 1).toLocaleString(locale, { month: "long" });
}

export function isSameDate(left: CalendarDate, right: CalendarDate): boolean {
  return (
    left.year === right.year &&
    left.monthIndex === right.monthIndex &&
    left.day === right.day
  );
}

export function isToday(
  year: number,
  monthIndex: number,
  day: number,
  today: CalendarDate,
): boolean {
  return (
    year === today.year && monthIndex === today.monthIndex && day === today.day
  );
}

export function isSelected(
  year: number,
  monthIndex: number,
  day: number,
  selected: CalendarDate,
): boolean {
  return (
    year === selected.year &&
    monthIndex === selected.monthIndex &&
    day === selected.day
  );
}
