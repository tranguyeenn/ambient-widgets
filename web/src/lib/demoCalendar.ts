export type CalendarDate = {
  year: number;
  monthIndex: number;
  day: number;
};

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getToday(): CalendarDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
    day: now.getDate(),
  };
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function buildMonthGrid(year: number, monthIndex: number): (number | null)[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const totalDays = daysInMonth(year, monthIndex);
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function formatMonthLabel(monthIndex: number): string {
  return MONTHS[monthIndex] ?? "Month";
}

export function previousMonth(year: number, monthIndex: number) {
  if (monthIndex === 0) return { year: year - 1, monthIndex: 11 };
  return { year, monthIndex: monthIndex - 1 };
}

export function nextMonth(year: number, monthIndex: number) {
  if (monthIndex === 11) return { year: year + 1, monthIndex: 0 };
  return { year, monthIndex: monthIndex + 1 };
}

export function isToday(
  year: number,
  monthIndex: number,
  day: number,
  today: CalendarDate,
): boolean {
  return (
    year === today.year &&
    monthIndex === today.monthIndex &&
    day === today.day
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
