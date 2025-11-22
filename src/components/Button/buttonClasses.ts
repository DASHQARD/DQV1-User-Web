import { cva } from 'class-variance-authority'

export const buttonClasses = cva(
  'flex items-center justify-center gap-2 text-sm font-medium transition whitespace-nowrap outline-none ring-offset-2 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-yellow-500 text-[#353535] hover:bg-yellow-500/80',
        secondary: 'text-white bg-primary-500 hover:bg-primary-500/80',
        outline: 'border border-grey hover:bg-black hover:text-white',
        danger: 'bg-red-500 text-white hover:bg-red-400',
        warning: 'bg-warning-500 text-white hover:bg-warning-400',
        ghost: 'bg-transparent text-black',
      },
      size: {
        small: 'h-8 px-4 rounded-sm !text-xs !font-normal',
        medium: 'h-10 px-4 rounded-sm !text-xs !font-normal',
        default: 'h-12 px-6 rounded-none',
      },
      disabled: {
        true: 'active:!scale-[1] cursor-not-allowed opacity-50 pointer-events-none',
        false: '',
      },
      shape: {
        square: 'rounded-none',
        rounded: 'rounded-sm',
        pill: 'rounded-full',
      },
      iconOnly: {
        true: '!p-3',
      },
      minW: {
        true: 'min-w-[48px]',
      },
    },
    compoundVariants: [
      {
        disabled: true,
        variant: 'primary',
        className: '!bg-white-400 !text-black/50 border-grey border !cursor-not-allowed',
      },
      {
        disabled: true,
        variant: 'secondary',
        className: '!bg-primary-500/50 !cursor-not-allowed',
      },
      {
        disabled: true,
        variant: 'outline',
        className: 'opacity-30',
      },
      {
        iconOnly: true,
        size: 'small',
        className: '!p-[10px]',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      iconOnly: false,
      disabled: false,
      shape: 'pill',
    },
  },
)
