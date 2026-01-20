import DatePicker from 'react-datepicker'

import dayjs from 'dayjs'

import { Button } from '@/components'
import { cn, Icon } from '@/libs'

import 'react-datepicker/dist/react-datepicker.css'
import './DateInput.scss'

export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  placeholder = 'Date',
  format = 'DD-MM-YYYY',
  maxDate,
  showButtonIcon = true,
  iconClassName,
}: {
  startDate?: Date | null
  endDate?: Date | null
  onChange: (dates: [Date | null, Date | null]) => void
  placeholder?: string
  format?: string
  maxDate?: Date
  showButtonIcon?: boolean
  iconClassName?: string
}) {
  return (
    <div className="relative w-max">
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
            variant="outline"
            as="span"
            className={cn(
              'font-normal w-max cursor-default !rounded-[6px] border border-[#E4E7EC] bg-white px-4 py-2 text-sm text-[#7C8689] hover:bg-white hover:border-[#E4E7EC] h-[38px]',
              {
                'font-medium text-[#212123]': startDate && endDate,
              },
            )}
            iconPosition="right"
            icon={showButtonIcon ? 'lucide:chevron-down' : ''}
            iconProps={{ width: '16', className: 'text-[#98A2B3]' }}
          >
            <Icon icon="hugeicons:calendar-04" className={cn('size-4', iconClassName)} />

            {startDate && endDate
              ? `${dayjs(startDate).format(format)} - ${dayjs(endDate).format(format)}`
              : `${placeholder}`}
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
