import { useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./CalendarWidget.css";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function buildMonthGrid(year: number, monthIndex: number): (number | null)[] {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }
  return cells;
}

export default function CalendarWidget() {
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const currentDate = today.getDate();

  const monthLabel = today.toLocaleString("default", { month: "long" });
  const days = useMemo(
    () => buildMonthGrid(year, monthIndex),
    [year, monthIndex],
  );

  const onDragMouseDown = () => {
    void getCurrentWindow().startDragging();
  };

  return (
    <article className="calendar-widget" aria-label="Calendar">
      <header
        className="calendar-widget__chrome"
        data-tauri-drag-region
        onMouseDown={onDragMouseDown}
      >
        <div className="calendar-widget__title">
          <h1 className="calendar-widget__month">{monthLabel}</h1>
          <span className="calendar-widget__year">{year}</span>
        </div>
      </header>

      <div className="calendar-widget__body">
        <div className="calendar-widget__weekdays" role="row">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={`w-${i}`} className="calendar-widget__weekday">
              {label}
            </span>
          ))}
        </div>

        <div className="calendar-widget__grid" role="grid">
          {days.map((day, index) => {
            const isToday = day === currentDate;
            return (
              <div
                key={day === null ? `pad-${index}` : `day-${day}`}
                className={`calendar-widget__cell${isToday ? " calendar-widget__cell--today" : ""}${day === null ? " calendar-widget__cell--empty" : ""}`}
                role="gridcell"
                aria-current={isToday ? "date" : undefined}
              >
                {day !== null ? day : null}
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
