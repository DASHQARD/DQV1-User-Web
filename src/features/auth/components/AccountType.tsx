import { Icon } from '@/libs'

interface AccountTypeProps {
  value?: 'user' | 'vendor' | 'corporate'
  onChange?: (value: 'user' | 'vendor' | 'corporate') => void
}

export default function AccountType({ value = 'user', onChange }: AccountTypeProps) {
  const handleClick = (type: 'user' | 'vendor' | 'corporate') => {
    onChange?.(type)
  }

  return (
    <div className="text-center mb-4">
      <div className="inline-block bg-gray-50 rounded-2xl p-1.5 border border-gray-200">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleClick('user')}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:px-5 md:py-3 border-none rounded-xl bg-transparent cursor-pointer transition-all duration-300 min-w-[120px] md:min-w-[140px] ${
              value === 'user'
                ? 'bg-gradient-to-br from-[#402D87] to-[#5B4397] text-white shadow-[0_4px_12px_rgba(64,45,135,0.3)]'
                : 'hover:bg-[rgba(64,45,135,0.05)]'
            }`}
          >
            <div className="flex items-center justify-center w-6 h-6">
              <Icon
                icon="bi:person-fill"
                className={`text-sm md:text-base transition-colors duration-300 ${
                  value === 'user' ? 'text-white' : 'text-gray-500'
                }`}
              />
            </div>
            <div className="flex flex-col items-start text-left">
              <span
                className={`text-[13px] md:text-sm leading-tight transition-all duration-300 ${
                  value === 'user' ? 'text-white font-semibold' : 'text-[#1a1a1a] font-medium'
                }`}
              >
                User
              </span>
              <span
                className={`text-[11px] md:text-xs leading-tight transition-all duration-300 ${
                  value === 'user' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                Personal account
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleClick('vendor')}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:px-5 md:py-3 border-none rounded-xl bg-transparent cursor-pointer transition-all duration-300 min-w-[120px] md:min-w-[140px] ${
              value === 'vendor'
                ? 'bg-gradient-to-br from-[#402D87] to-[#5B4397] text-white shadow-[0_4px_12px_rgba(64,45,135,0.3)]'
                : 'hover:bg-[rgba(64,45,135,0.05)]'
            }`}
          >
            <div className="flex items-center justify-center w-6 h-6">
              <Icon
                icon="bi:shop-window"
                className={`text-sm md:text-base transition-colors duration-300 ${
                  value === 'vendor' ? 'text-white' : 'text-gray-500'
                }`}
              />
            </div>
            <div className="flex flex-col items-start text-left">
              <span
                className={`text-[13px] md:text-sm leading-tight transition-all duration-300 ${
                  value === 'vendor' ? 'text-white font-semibold' : 'text-[#1a1a1a] font-medium'
                }`}
              >
                Vendor
              </span>
              <span
                className={`text-[11px] md:text-xs leading-tight transition-all duration-300 ${
                  value === 'vendor' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                Vendor account
              </span>
            </div>
          </button>

          {/* <button
            type="button"
            onClick={() => handleClick('corporate')}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:px-5 md:py-3 border-none rounded-xl bg-transparent cursor-pointer transition-all duration-300 min-w-[120px] md:min-w-[140px] ${
              value === 'corporate'
                ? 'bg-gradient-to-br from-[#402D87] to-[#5B4397] text-white shadow-[0_4px_12px_rgba(64,45,135,0.3)]'
                : 'hover:bg-[rgba(64,45,135,0.05)]'
            }`}
          >
            <div className="flex items-center justify-center w-6 h-6">
              <Icon
                icon="bi:building-fill"
                className={`text-sm md:text-base transition-colors duration-300 ${
                  value === 'corporate' ? 'text-white' : 'text-gray-500'
                }`}
              />
            </div>
            <div className="flex flex-col items-start text-left">
              <span
                className={`text-[13px] md:text-sm leading-tight transition-all duration-300 ${
                  value === 'corporate' ? 'text-white font-semibold' : 'text-[#1a1a1a] font-medium'
                }`}
              >
                Corporate
              </span>
              <span
                className={`text-[11px] md:text-xs leading-tight transition-all duration-300 ${
                  value === 'corporate' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                Business account
              </span>
            </div>
          </button> */}
        </div>
      </div>
    </div>
  )
}
