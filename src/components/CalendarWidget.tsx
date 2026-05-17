import { useMemo, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  formatMonthLabel,
  getMonthView,
  getToday,
  isSelected,
  isToday,
  nextMonth,
  previousMonth,
  WEEKDAY_LABELS,
  type CalendarDate,
} from "../utils/calendar";
import "./CalendarWidget.css";

export default function CalendarWidget() {
  const today = useMemo(() => getToday(), []);
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonthIndex, setViewMonthIndex] = useState(today.monthIndex);
  const [selected, setSelected] = useState<CalendarDate>(today);

  const monthView = useMemo(
    () => getMonthView(viewYear, viewMonthIndex),
    [viewYear, viewMonthIndex],
  );

  const monthLabel = formatMonthLabel(viewMonthIndex);

  const onDragMouseDown = () => {
    void getCurrentWindow().startDragging();
  };

  const goToPreviousMonth = () => {
    const prev = previousMonth(viewYear, viewMonthIndex);
    setViewYear(prev.year);
    setViewMonthIndex(prev.monthIndex);
  };

  const goToNextMonth = () => {
    const next = nextMonth(viewYear, viewMonthIndex);
    setViewYear(next.year);
    setViewMonthIndex(next.monthIndex);
  };

  const selectDay = (day: number) => {
    setSelected({
      year: viewYear,
      monthIndex: viewMonthIndex,
      day,
    });
  };

  return (
    <article className="calendar-widget" aria-label="Calendar">
      <header className="calendar-widget__chrome">
        <div className="calendar-widget__nav-row">
          <button
            type="button"
            className="calendar-widget__nav-btn"
            aria-label="Previous month"
            onClick={goToPreviousMonth}
          >
            ‹
          </button>

          <div
            className="calendar-widget__title"
            data-tauri-drag-region
            onMouseDown={onDragMouseDown}
          >
            <h1 className="calendar-widget__month">{monthLabel}</h1>
            <span className="calendar-widget__year">{viewYear}</span>
          </div>

          <button
            type="button"
            className="calendar-widget__nav-btn"
            aria-label="Next month"
            onClick={goToNextMonth}
          >
            ›
          </button>
        </div>
      </header>

      <div className="calendar-widget__body">
        <div className="calendar-widget__weekdays" role="row">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={`weekday-${index}`} className="calendar-widget__weekday">
              {label}
            </span>
          ))}
        </div>

        <div className="calendar-widget__grid" role="grid">
          {monthView.cells.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`pad-${viewYear}-${viewMonthIndex}-${index}`}
                  className="calendar-widget__cell calendar-widget__cell--empty"
                  role="gridcell"
                  aria-hidden
                />
              );
            }

            const dayIsToday = isToday(
              viewYear,
              viewMonthIndex,
              day,
              today,
            );
            const dayIsSelected = isSelected(
              viewYear,
              viewMonthIndex,
              day,
              selected,
            );

            const classNames = [
              "calendar-widget__cell",
              dayIsToday ? "calendar-widget__cell--today" : "",
              dayIsSelected ? "calendar-widget__cell--selected" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={`day-${viewYear}-${viewMonthIndex}-${day}`}
                type="button"
                className={classNames}
                role="gridcell"
                aria-label={`${monthLabel} ${day}, ${viewYear}`}
                aria-current={dayIsToday ? "date" : undefined}
                aria-pressed={dayIsSelected}
                onClick={() => selectDay(day)}
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
