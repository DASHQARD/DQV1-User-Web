import DatePicker from 'react-datepicker'

import dayjs from 'dayjs'

import { Button } from '@/components'
import { cn, Icon } from '@/libs'

import 'react-datepicker/dist/react-datepicker.css'
import './DateInput.scss'

const DATE_RANGE_FILTER_BUTTON_CLASSNAME =
  'border border-[#e2e4ed] bg-white py-0 rounded-md w-full sm:w-auto text-xs text-[#7c8689] font-normal min-w-0 truncate justify-between'

export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  placeholder = 'Date',
  format = 'DD-MM-YYYY',
  maxDate,
  showButtonIcon = true,
  iconClassName,
  className,
}: {
  startDate?: Date | null
  endDate?: Date | null
  onChange: (dates: [Date | null, Date | null]) => void
  placeholder?: string
  format?: string
  maxDate?: Date
  showButtonIcon?: boolean
  iconClassName?: string
  className?: string
}) {
  return (
    <div className={cn('relative w-full min-w-0', className)}>
      <DatePicker
        showPopperArrow={false}
        selectsRange
        selected={startDate}
        startDate={startDate}
        endDate={endDate}
        maxDate={maxDate}
        calendarClassName="date-range-calendar"
        customInput={
          <Button
            variant="ghost"
            as="span"
            size="medium"
            className={cn('cursor-default', DATE_RANGE_FILTER_BUTTON_CLASSNAME)}
            iconPosition="right"
            icon={showButtonIcon ? 'lucide:chevron-down' : ''}
            iconProps={{ width: '16', className: 'text-[#98A2B3]' }}
          >
            <Icon
              icon="hugeicons:calendar-04"
              className={cn(
                'size-4 shrink-0 text-[#98A2B3]',
                startDate && endDate && 'text-[#212123]',
                iconClassName,
              )}
            />

            {startDate && endDate ? (
              <span className="text-[#212123]">
                {`${dayjs(startDate).format(format)} - ${dayjs(endDate).format(format)}`}
              </span>
            ) : (
              <span className="text-[#7c8689]">{placeholder}</span>
            )}
          </Button>
        }
        onChange={onChange}
      />
      {(startDate || endDate) && (
        <button
          className="absolute grid w-6 h-6 bg-white rounded-full right-4 top-1/2 -translate-y-1/2 place-content-center"
          onClick={() => onChange([null, null])}
          aria-label="clear date range"
        >
          <Icon icon="hugeicons:cancel-01" width={16} />
        </button>
      )}
    </div>
  )
}
