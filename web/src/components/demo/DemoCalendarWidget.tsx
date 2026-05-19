import { useMemo, useState } from "react";
import {
  buildMonthGrid,
  formatMonthLabel,
  getToday,
  isSelected,
  isToday,
  nextMonth,
  previousMonth,
  WEEKDAY_LABELS,
  type CalendarDate,
} from "../../lib/demoCalendar";

export default function DemoCalendarWidget() {
  const today = useMemo(() => getToday(), []);
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonthIndex, setViewMonthIndex] = useState(today.monthIndex);
  const [selected, setSelected] = useState<CalendarDate>(today);

  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonthIndex),
    [viewYear, viewMonthIndex],
  );

  return (
    <article className="demo-widget-glass demo-cal" aria-label="Calendar preview">
      <header className="demo-widget-glass__chrome demo-cal__chrome">
        <div className="demo-cal__nav-row">
          <button
            type="button"
            className="demo-cal__nav-btn"
            aria-label="Previous month"
            onClick={() => {
              const p = previousMonth(viewYear, viewMonthIndex);
              setViewYear(p.year);
              setViewMonthIndex(p.monthIndex);
            }}
          >
            ‹
          </button>
          <div className="demo-cal__title">
            <h1 className="demo-cal__month">{formatMonthLabel(viewMonthIndex)}</h1>
            <span className="demo-cal__year">{viewYear}</span>
          </div>
          <button
            type="button"
            className="demo-cal__nav-btn"
            aria-label="Next month"
            onClick={() => {
              const n = nextMonth(viewYear, viewMonthIndex);
              setViewYear(n.year);
              setViewMonthIndex(n.monthIndex);
            }}
          >
            ›
          </button>
        </div>
      </header>
      <div className="demo-cal__body">
        <div className="demo-cal__weekdays" role="row">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={`wd-${i}`} className="demo-cal__weekday">
              {label}
            </span>
          ))}
        </div>
        <div className="demo-cal__grid" role="grid">
          {cells.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="demo-cal__cell demo-cal__cell--empty"
                  aria-hidden
                />
              );
            }
            const todayCell = isToday(viewYear, viewMonthIndex, day, today);
            const selectedCell = isSelected(
              viewYear,
              viewMonthIndex,
              day,
              selected,
            );
            return (
              <button
                key={`${viewYear}-${viewMonthIndex}-${day}`}
                type="button"
                role="gridcell"
                className={[
                  "demo-cal__cell",
                  todayCell ? "demo-cal__cell--today" : "",
                  selectedCell ? "demo-cal__cell--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setSelected({
                    year: viewYear,
                    monthIndex: viewMonthIndex,
                    day,
                  })
                }
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}
