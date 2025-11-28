export function ProgressCircle({ currentProgress }: { readonly currentProgress: number }) {
  const gradientId = 'linearGradient'
  const circleSize = 30
  const strokeWidth = 2
  const radius = (circleSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - currentProgress / 100)

  const circleFillStyles = {
    fill: 'none',
    strokeWidth,
    strokeLinecap: 'round',
    strokeDasharray: circumference,
    strokeDashoffset: offset,
  }

  const circleBackgroundStyles = {
    fill: 'none',
    stroke: '#FBE5D1',
    strokeWidth,
    strokeLinecap: 'round',
    strokeDasharray: circumference,
  }
  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center">
      <svg
        className="absolute inset-0 -rotate-90"
        width="72"
        height="72"
        viewBox={`0 0 ${circleSize} ${circleSize}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop style={{ stopColor: '#EB7B1A' }} offset="0%" />
            <stop style={{ stopColor: 'rgba(235, 123, 26, 0.0)' }} offset="77.77%" />
          </linearGradient>
        </defs>
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          style={{ ...circleBackgroundStyles, strokeLinecap: 'round' as const }}
        />
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          style={{
            ...circleFillStyles,
            stroke: `url(#${gradientId})`,
            strokeLinecap: 'round' as const,
          }}
        />
      </svg>
      <span className="text-sm font-bold leading-[150%] tracking-[0.7px] text-center text-[#EB7B1A]">
        {currentProgress}%
      </span>
    </div>
  )
}
