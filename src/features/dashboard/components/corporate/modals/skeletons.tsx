export function TransactionDetailsSkeleton() {
  return (
    <div className="h-full px-6 flex flex-col justify-between animate-pulse">
      <div className="grow">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-1 py-3 border-t border-t-gray-200 first:border-0"
          >
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center gap-3">
        <div className="h-10 w-1/2 bg-gray-200 rounded" />
        <div className="h-10 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
