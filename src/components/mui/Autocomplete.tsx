import { Autocomplete as MUIAutocomplete, TextField } from '@mui/material'
import { ComponentProps, useCallback } from 'react'
import { useBoolean } from '../../utils/hooks'

interface Props<T extends string> {
  disabled?: boolean
  getOptionLabel: (id: T) => string
  label: ComponentProps<typeof TextField>['label']
  onChange: (id: T) => void
  onKeyDown: ComponentProps<typeof TextField>['onKeyDown']
  options: Array<T>
  required: ComponentProps<typeof TextField>['required']
  value: T
}

export function Autocomplete<T extends string>({
  disabled,
  getOptionLabel,
  label,
  onChange,
  onKeyDown,
  options,
  required,
  value
}: Props<T>) {
  const [isOpen, open, close] = useBoolean(false)
  const onChangeId = useCallback((_: unknown, id: T) => onChange(id), [onChange])

  return (
    <MUIAutocomplete
      autoHighlight
      disableClearable
      disabled={disabled}
      fullWidth
      getOptionLabel={getOptionLabel}
      multiple={false}
      onChange={onChangeId}
      onClose={close}
      onOpen={open}
      openOnFocus
      options={options}
      renderInput={(params) =>
        <TextField
          {...params}
          label={label}
          onKeyDown={isOpen ? undefined : onKeyDown}
          required={required}
          size='small'
        />
      }
      value={value!}
    />
  )
}