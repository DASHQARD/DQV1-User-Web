import { Icon } from '@/libs'
import { cn } from '@/libs'

export interface MetricsCardProps {
  icon: string
  value: string | number
  label: string
  iconBgColor?: string
  valueColor?: string
  className?: string
}

export default function MetricsCard({
  icon,
  value,
  label,
  iconBgColor = 'bg-linear-to-br from-[#402D87] to-[#2d1a72]',
  valueColor = 'text-[#402D87]',
  className,
}: MetricsCardProps) {
  return (
    <div
      className={cn(
        'group relative bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#e8eaf0] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(64,45,135,0.18)] hover:border-[#402D87]/20 overflow-hidden',
        className,
      )}
    >
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-[#402D87]/0 via-[#2d1a72]/0 to-[#402D87]/0 group-hover:from-[#402D87]/8 group-hover:via-[#2d1a72]/5 group-hover:to-[#402D87]/8 transition-all duration-500 pointer-events-none" />

      {/* Top accent border on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#402D87] via-[#7950ed] to-[#402D87] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

      <div className="relative flex items-center gap-5">
        <div
          className={cn(
            'relative w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-[0_4px_12px_rgba(64,45,135,0.3)] group-hover:shadow-[0_8px_20px_rgba(64,45,135,0.4)]',
            iconBgColor,
          )}
        >
          {/* Icon glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <Icon icon={icon} className="relative z-10" />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'text-3xl font-bold mb-2 leading-tight transition-all duration-300 group-hover:scale-105',
              valueColor,
            )}
          >
            {value}
          </div>
          <div className="text-sm text-[#6c757d] font-medium leading-relaxed tracking-wide">
            {label}
          </div>
        </div>
      </div>

      {/* Decorative corner element */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-linear-to-tl from-[#402D87]/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}
