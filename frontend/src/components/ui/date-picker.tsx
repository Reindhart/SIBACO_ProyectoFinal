import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

type DatePickerProps = {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
  disableMonth?: boolean
  disableYear?: boolean
  minDate?: Date
  maxDate?: Date
  // allow passing any other react-datepicker props if needed
  [key: string]: any
}

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

function getYearRange(minDate?: Date, maxDate?: Date) {
  const thisYear = new Date().getFullYear()
  const start = minDate ? minDate.getFullYear() : thisYear - 10
  const end = maxDate ? maxDate.getFullYear() : thisYear + 10
  const years: number[] = []
  for (let y = start; y <= end; y++) years.push(y)
  return years
}

export const DatePickerCustom: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  placeholder = 'Seleccionar fecha',
  className = '',
  disableMonth = false,
  disableYear = false,
  minDate,
  maxDate,
  ...rest
}) => {
  const years = React.useMemo(() => getYearRange(minDate, maxDate), [minDate, maxDate])
  const currentViewMonthRef = React.useRef<number>(selected ? selected.getMonth() : new Date().getMonth())

  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        className={`input input-bordered pr-10 cursor-pointer ${className}`}
        dayClassName={(d) => (d.getMonth() !== (currentViewMonthRef.current ?? d.getMonth()) ? 'opacity-40' : '')}
        renderCustomHeader={({
        date,
        changeMonth,
        changeYear,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => {
        const month = date.getMonth()
        const year = date.getFullYear()

        // update visible month ref for day styling
        currentViewMonthRef.current = month

        // build title showing only the parts that are not replaced by selects
        const titleParts: string[] = []
        if (disableMonth) titleParts.push(monthNames[month])
        if (disableYear) titleParts.push(String(year))
        const titleText = titleParts.join(' ')

        return (
          <div className="flex items-center justify-between px-3 py-2 bg-white border-b">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="btn btn-ghost btn-sm p-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              {/* Month selector (if enabled) */}
              {!disableMonth && (
                <select
                  value={month}
                  onChange={(e) => changeMonth(Number(e.target.value))}
                  className="select select-sm"
                >
                  {monthNames.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              )}

              {/* Title shows only the parts not replaced by selectors */}
              {titleText && <div className="font-medium">{titleText}</div>}

              {/* Year selector (if enabled) */}
              {!disableYear && (
                <select
                  value={year}
                  onChange={(e) => changeYear(Number(e.target.value))}
                  className="select select-sm"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="btn btn-ghost btn-sm p-1"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )
      }}
      {...rest}
      />

      <Calendar className="h-5 w-5 text-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  )
}

export default DatePickerCustom
