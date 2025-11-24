import type { SelectComponentsConfig, StylesConfig } from 'react-select'
import CreatableReactSelect from 'react-select/creatable'

import { cn, Icon } from '@/libs'
import type { DropdownOption } from '@/types'

import { InputLabel } from '../InputLabel'
import { Loader } from '../Loader'
import { ErrorText } from '../Text'

type Props = {
  options?: DropdownOption[]
  onChange?: any
  value?: any
  extraOnChange?: (option: any) => void
  error?: string | { message: string } | boolean
  label?: string
  className?: string
  isDropdown?: boolean
  iconBefore?: string
} & React.ComponentProps<typeof CreatableReactSelect>

export function CreatableCombobox(props: Props) {
  const { options, onChange, value, extraOnChange, error, label, isDropdown, iconBefore, ...rest } =
    props

  return (
    <div className={cn(props.className)}>
      {label && <InputLabel htmlFor={props?.id ?? props.name}>{label}</InputLabel>}
      <div
        className={cn(
          'border focus-within:border-primary-400 hover:border-primary-400 border-gray-300 rounded-lg flex justify-between flex-1 items-center overflow-hidden',
          {
            'hover:border-gray-300 border-gray-300 rounded-xl': isDropdown,
          },
        )}
      >
        {iconBefore && <Icon icon={iconBefore} className="ml-2" />}
        <CreatableReactSelect
          id={props?.id ?? props.name}
          options={options}
          menuPosition="fixed"
          onChange={(option: any, { name }) => {
            if (props.isMulti) {
              onChange(option)
            } else {
              // FIX: Handle both selected and created options properly
              const value = option?.value ?? option?.label ?? ''
              onChange({ target: { value, name } })
            }
            extraOnChange?.(option)
          }}
          value={
            props.isMulti
              ? value
              : (options?.find((option) => option.value === value) ??
                (value ? { value, label: value } : null))
          }
          isClearable
          isSearchable
          formatCreateLabel={(inputValue) => `Create: "${inputValue}"`}
          components={{ ...props.components, ...selectComponents }}
          {...rest}
          styles={deepMergeStyles(selectStyles, props.styles)}
        />
      </div>
      <ErrorText error={error} />
    </div>
  )
}

const selectComponents: Partial<SelectComponentsConfig<any, any, any>> = {
  LoadingIndicator: () => (
    <div className="flex justify-center items-center">
      <div>
        <Loader />
      </div>
    </div>
  ),
  IndicatorSeparator: () => null,
}

const selectStyles: StylesConfig<any> = {
  container: (baseStyles) => ({
    ...baseStyles,
    flexGrow: 1,
  }),
  control: (baseStyles) => ({
    ...baseStyles,
    borderWidth: '1px',
    paddingBlock: '2px',
    paddingInline: '0',
    height: '48px',
    border: 'none',
    minWidth: '0',
    flex: '1',
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: 'var(--color-gray-300)',
    fontSize: '16px',
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: 'var(--color-gray-100)',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: 'var(--color-gray-100)',
    borderRadius: '4px',
  }),
  multiValueLabel: (baseStyles) => ({
    ...baseStyles,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  multiValueRemove: (baseStyles) => ({
    ...baseStyles,
    ':hover': {
      backgroundColor: 'var(--color-gray-100)',
      borderRadius: '4px',
      color: 'var(--color-error-500)',
    },
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    background: 'white',
    padding: '4px',
    borderRadius: '8px',
    boxShadow: '0',
    border: '1px solid var(--color-gray-200)',
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    color: 'black',
    borderRadius: '8px',
    padding: '8px',
    whiteSpace: 'normal',
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    hyphens: 'none',
    ':hover': {
      backgroundColor: state.isSelected ? 'var(--color-gray-100)' : 'var(--color-gray-50)',
    },
    backgroundColor: state.isSelected
      ? 'var(--color-gray-100)'
      : state.isFocused
        ? 'white'
        : 'white',
  }),
}

const deepMergeStyles = (base: any, overrides: any) => {
  if (!overrides) return base
  return Object.keys(overrides).reduce(
    (merged, key) => {
      if (typeof base[key] === 'function' && typeof overrides[key] === 'function') {
        merged[key] = (baseStyles: any, state: any) => ({
          ...base[key](baseStyles, state),
          ...overrides[key](baseStyles, state),
        })
      } else if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
        merged[key] = deepMergeStyles(base[key], overrides[key])
      } else {
        merged[key] = overrides[key]
      }

      return merged
    },
    { ...base },
  )
}
