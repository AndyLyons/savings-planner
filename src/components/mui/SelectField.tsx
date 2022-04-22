import { FormControl, InputLabel, MenuItem, NativeSelect, Select } from '@mui/material'
import { ComponentProps, useCallback } from 'react'
import { useIsDesktop } from '../../utils/breakpoints'

interface Props {
  allowEmpty?: boolean
  error?: ComponentProps<typeof FormControl>['error']
  fullWidth?: ComponentProps<typeof FormControl>['fullWidth']
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string, value: string }>
  emptyLabel?: string
  required?: ComponentProps<typeof FormControl>['required']
  size?: ComponentProps<typeof FormControl>['size']
  sx?: ComponentProps<typeof FormControl>['sx']
  value: string
  variant?: ComponentProps<typeof FormControl>['variant']
}

export function SelectField({
  allowEmpty = false,
  error,
  fullWidth,
  label,
  onChange,
  options,
  emptyLabel = 'None',
  required,
  size,
  sx,
  value,
  variant
}: Props) {
  const isDesktop = useIsDesktop()
  const onChangeEvent = useCallback((e: { target: { value: string} }) => onChange(e.target.value), [onChange])

  return (
    <FormControl
      error={error}
      fullWidth={fullWidth}
      required={required}
      size={size}
      sx={sx}
      variant={variant}
    >
      <InputLabel id={`${label}-select-label`} htmlFor={`native-${label}-select`}>{label}</InputLabel>
      {
        isDesktop
          ? (
            <Select
              id={`${label}-select`}
              labelId={`${label}-select-label`}
              label={label}
              onChange={onChangeEvent}
              value={value}
            >
              {allowEmpty && <MenuItem value=''><em>{emptyLabel}</em></MenuItem>}
              {options.map(({ label, value }) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
            </Select>
          ) : (
            <NativeSelect
              onChange={onChangeEvent}
              inputProps={{
                id: `native-${label}-select`
              }}
              value={value}
            >
              {(value === '' || allowEmpty) && <option hidden value='' style={{ display: 'none' }}><em>{emptyLabel}</em></option>}
              {options.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
            </NativeSelect>
          )
      }
    </FormControl>
  )
}