"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

type CalendarDatePickerTheme = "light" | "dark";
type CalendarDatePickerAccent = "red" | "cyan";
type CalendarDatePickerOutputFormat = "iso" | "display";

type CalendarDatePickerProps = {
  name?: string;
  label?: string;
  ariaLabel?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  outputFormat?: CalendarDatePickerOutputFormat;
  placeholder?: string;
  theme?: CalendarDatePickerTheme;
  accent?: CalendarDatePickerAccent;
  className?: string;
  labelClassName?: string;
  buttonClassName?: string;
  panelClassName?: string;
  clearable?: boolean;
  minYear?: number;
  maxYear?: number;
};

const weekDayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const themeClasses = {
  light: {
    label: "text-sm font-bold text-slate-700",
    button:
      "h-11 rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none transition focus:bg-white",
    icon: "text-slate-400",
    placeholder: "text-slate-400",
    value: "text-slate-900",
    panel:
      "border-slate-200 bg-white text-slate-950 shadow-xl shadow-slate-900/10",
    mutedText: "text-slate-400",
    navButton:
      "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950",
    select:
      "border-slate-200 bg-white text-slate-800 focus:border-red-500",
    offMonth: "text-slate-300 hover:bg-slate-50 hover:text-slate-500",
    normalDay: "text-slate-800",
    footer: "border-slate-100",
    clearButton: "text-slate-500 hover:bg-slate-50 hover:text-slate-950",
  },
  dark: {
    label: "text-xs font-bold uppercase text-white/45",
    button:
      "h-11 rounded-md border border-white/10 bg-black/30 text-sm font-semibold text-white outline-none transition",
    icon: "text-white/45",
    placeholder: "text-white/35",
    value: "text-white",
    panel:
      "border-white/10 bg-[#151719] text-white shadow-2xl shadow-black/40",
    mutedText: "text-white/40",
    navButton:
      "border-white/10 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white",
    select:
      "border-white/10 bg-black/30 text-white focus:border-red-500",
    offMonth: "text-white/25 hover:bg-white/5 hover:text-white/55",
    normalDay: "text-white/85",
    footer: "border-white/10",
    clearButton: "text-white/55 hover:bg-white/10 hover:text-white",
  },
} as const;

const accentClasses = {
  red: {
    selected: "bg-red-600 text-white shadow-sm shadow-red-600/20",
    current: "ring-1 ring-red-200",
    hoverLight: "hover:bg-red-50 hover:text-red-700",
    hoverDark: "hover:bg-red-600/20 hover:text-red-100",
    focus: "focus:border-red-500 focus:ring-2 focus:ring-red-100",
    actionText: "text-red-600 hover:bg-red-50",
    actionDark: "text-red-300 hover:bg-red-600/20 hover:text-red-100",
  },
  cyan: {
    selected: "bg-cyan-400 text-black shadow-sm shadow-cyan-400/20",
    current: "ring-1 ring-cyan-300/70",
    hoverLight: "hover:bg-cyan-50 hover:text-cyan-700",
    hoverDark: "hover:bg-cyan-400/15 hover:text-cyan-100",
    focus: "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100",
    actionText: "text-cyan-700 hover:bg-cyan-50",
    actionDark: "text-cyan-200 hover:bg-cyan-400/15 hover:text-cyan-100",
  },
} as const;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function formatCalendarDateDisplay(date: Date) {
  return `${padDatePart(date.getDate())}/${padDatePart(
    date.getMonth() + 1,
  )}/${date.getFullYear()}`;
}

export function formatCalendarDateIso(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`;
}

export function parseCalendarDateValue(value?: string) {
  if (!value) {
    return null;
  }

  const displayMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const day = displayMatch ? Number(displayMatch[1]) : Number(isoMatch?.[3]);
  const month = displayMatch ? Number(displayMatch[2]) : Number(isoMatch?.[2]);
  const year = displayMatch ? Number(displayMatch[3]) : Number(isoMatch?.[1]);

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameCalendarDate(first: Date | null, second: Date | null) {
  return Boolean(
    first &&
      second &&
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate(),
  );
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - mondayBasedOffset + 1);

    return {
      date,
      currentMonth: date.getMonth() === month,
    };
  });
}

function getOutputValue(date: Date, outputFormat: CalendarDatePickerOutputFormat) {
  return outputFormat === "display"
    ? formatCalendarDateDisplay(date)
    : formatCalendarDateIso(date);
}

export default function CalendarDatePicker({
  name,
  label,
  ariaLabel,
  value,
  defaultValue,
  onChange,
  outputFormat = "iso",
  placeholder = "Chọn ngày",
  theme = "light",
  accent = "red",
  className = "",
  labelClassName = "",
  buttonClassName = "",
  panelClassName = "",
  clearable = true,
  minYear = 1900,
  maxYear = 2100,
}: CalendarDatePickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const controlled = value !== undefined;
  const initialDate = parseCalendarDateValue(value ?? defaultValue);
  const [open, setOpen] = useState(false);
  const [internalDate, setInternalDate] = useState<Date | null>(initialDate);
  const [viewDate, setViewDate] = useState(() =>
    startOfMonth(initialDate ?? new Date()),
  );
  const selectedDate = controlled ? parseCalendarDateValue(value) : internalDate;
  const displayValue = selectedDate ? formatCalendarDateDisplay(selectedDate) : "";
  const hiddenValue = selectedDate ? getOutputValue(selectedDate, outputFormat) : "";
  const today = new Date();
  const years = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index),
    [maxYear, minYear],
  );
  const styles = themeClasses[theme];
  const accentStyles = accentClasses[accent];
  const dayHoverClass =
    theme === "dark" ? accentStyles.hoverDark : accentStyles.hoverLight;
  const actionClass =
    theme === "dark" ? accentStyles.actionDark : accentStyles.actionText;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node) || pickerRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open) {
      setViewDate(startOfMonth(selectedDate ?? new Date()));
    }

    setOpen((current) => !current);
  };

  const moveMonth = (offset: number) => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const selectDate = (date: Date) => {
    if (!controlled) {
      setInternalDate(date);
    }

    setViewDate(startOfMonth(date));
    setOpen(false);
    onChange?.(formatCalendarDateIso(date));
  };

  const clearDate = () => {
    if (!controlled) {
      setInternalDate(null);
    }

    setOpen(false);
    onChange?.("");
  };

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={hiddenValue} /> : null}

      {label ? (
        <label
          htmlFor={inputId}
          className={`mb-2 block ${styles.label} ${labelClassName}`}
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        <button
          id={inputId}
          type="button"
          aria-label={ariaLabel ?? label ?? placeholder}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggleOpen}
          className={`relative flex w-full cursor-pointer items-center pl-10 pr-10 text-left ${styles.button} ${accentStyles.focus} ${buttonClassName}`}
        >
          <CalendarDays
            size={17}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${styles.icon}`}
          />
          <span
            className={`block min-w-0 flex-1 truncate ${
              displayValue ? styles.value : styles.placeholder
            }`}
          >
            {displayValue || placeholder}
          </span>
        </button>

        {clearable && displayValue ? (
          <button
            type="button"
            aria-label="Xóa ngày"
            onClick={(event) => {
              event.stopPropagation();
              clearDate();
            }}
            className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition ${styles.clearButton}`}
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-label={ariaLabel ?? label ?? "Chọn ngày"}
          className={`absolute left-0 top-full z-50 mt-2 w-full min-w-72 rounded-md border p-3 ${styles.panel} ${panelClassName}`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Tháng trước"
              onClick={() => moveMonth(-1)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition ${styles.navButton}`}
            >
              <ChevronLeft size={17} />
            </button>

            <select
              aria-label="Chọn tháng"
              value={viewDate.getMonth()}
              onChange={(event) =>
                setViewDate(
                  new Date(viewDate.getFullYear(), Number(event.target.value), 1),
                )
              }
              className={`h-9 min-w-0 flex-1 rounded-md border px-2 text-sm font-black outline-none ${styles.select}`}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  Tháng {index + 1}
                </option>
              ))}
            </select>

            <select
              aria-label="Chọn năm"
              value={viewDate.getFullYear()}
              onChange={(event) =>
                setViewDate(new Date(Number(event.target.value), viewDate.getMonth(), 1))
              }
              className={`h-9 w-24 rounded-md border px-2 text-sm font-black outline-none ${styles.select}`}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <button
              type="button"
              aria-label="Tháng sau"
              onClick={() => moveMonth(1)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition ${styles.navButton}`}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div
            className={`mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase ${styles.mutedText}`}
          >
            {weekDayLabels.map((weekdayLabel) => (
              <span key={weekdayLabel} className="py-1">
                {weekdayLabel}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {getCalendarDays(viewDate).map(({ date, currentMonth }) => {
              const selected = isSameCalendarDate(date, selectedDate);
              const currentDay = isSameCalendarDate(date, today);

              return (
                <button
                  key={formatCalendarDateIso(date)}
                  type="button"
                  aria-label={`Chọn ngày ${formatCalendarDateDisplay(date)}`}
                  aria-pressed={selected}
                  onClick={() => selectDate(date)}
                  className={`flex aspect-square min-h-9 items-center justify-center rounded-md text-sm font-black transition ${
                    selected
                      ? accentStyles.selected
                      : currentMonth
                        ? `${styles.normalDay} ${dayHoverClass}`
                        : styles.offMonth
                  } ${currentDay && !selected ? accentStyles.current : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div
            className={`mt-3 flex items-center justify-between border-t pt-3 ${styles.footer}`}
          >
            <button
              type="button"
              onClick={() => selectDate(today)}
              className={`rounded-md px-2 py-1.5 text-xs font-black transition ${actionClass}`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={clearDate}
              className={`rounded-md px-2 py-1.5 text-xs font-black transition ${styles.clearButton}`}
            >
              Xóa
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
