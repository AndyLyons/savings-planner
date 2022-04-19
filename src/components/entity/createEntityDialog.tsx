import { Delete } from '@mui/icons-material'
import { DatePicker } from '@mui/lab'
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, TextField, TextFieldProps
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { cloneElement, ReactElement, useCallback, useReducer } from 'react'
import { fromYYYYMM, isDate, toYYYYMM, YYYYMM } from '../../utils/date'
import { entries, KeyValues } from '../../utils/fn'
import { getTargetChecked, getTargetValue, useKeyPress, useStopEvent } from '../../utils/hooks'
import { Autocomplete, IconField } from '../mui'

type FieldType<T> =
  T extends YYYYMM ? 'yyyymm' :
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  never

type Fields<T> = {
  [P in keyof Partial<T>]: {
    icon: ReactElement
    label: string
    readonly?: boolean
    required?: boolean
    type: FieldType<T[P]>
    useOptions?: () => Array<{ id: string, label: string }>
    useConstantOption?: () => { label: string, value: T[P], constantValue: T[P] }
    getEnabled?: (state: Partial<T>) => boolean
  }
}

export function createEntityDialog<T>(name: string, icon: ReactElement, fields: Fields<T>) {
  const fieldEntries = entries(fields)

  const iconWithMargin = cloneElement(icon, { sx: { mr: 2, ...icon.props.sx } })

  function reducer(state: Partial<T>, action: KeyValues<T>) {
    return {
      ...state,
      [action.key]: action.value
    } as Partial<T>
  }

  const verifyState = (state: Partial<T>): state is T =>
    entries(fields).every(([name, config]) => {
      const isDisabled = config.getEnabled && !config.getEnabled(state)
      return !config.required || isDisabled || state[name] !== undefined
    })

  interface Props {
    initialValues?: Partial<T>
    onClose: () => void
    onDelete?: () => void
    onDone: (details: T) => void
  }

  const EntityDialog = observer(function EntityDialog({ initialValues, onClose, onDelete, onDone }: Props) {
    const isEdit = Boolean(onDelete)
    const title = isEdit ? 'Edit' : 'Create'

    const [state, dispatch] = useReducer(reducer, initialValues ?? {})
    const isValid = verifyState(state)

    const onDoneClick = useStopEvent(() => {
      if (isValid) {
        onDone(state)
        onClose()
      }
    })
    const onEnterKey = useKeyPress('Enter', onDoneClick)
    const onDeleteClick = useStopEvent(
      useCallback(() => {
        onDelete?.()
        onClose()
      }, [onClose, onDelete])
    )

    return (
      <>
        <Dialog fullWidth maxWidth='xs' open onClose={onClose}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>{iconWithMargin} {title} {name}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
            {
              fieldEntries.map(([name, field], index) => {
                const { type, icon, label, readonly, required, getEnabled, useOptions, useConstantOption } = field
                // Fields are static at runtime - this will either always be called
                // or never be called and wont change each render
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const isEnabled = getEnabled ? getEnabled(state) : true
                const isDisabled = !isEnabled || (isEdit && readonly)

                return (
                  <IconField key={`${name}`} icon={icon} sx={{ mt: index === 0 ? 1 : 0, mb: index < fieldEntries.length ? 2 : 0 }}>
                    {type === 'string' && useOptions && (() => {
                      // This is OK because the fields can't change at runtime
                      // and will always run in exactly the same order
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      const options = useOptions()
                      return (
                        <Autocomplete
                          disabled={isDisabled}
                          label={label}
                          getOptionLabel={(optionId) => options.find(({ id }) => id === optionId)?.label ?? ''}
                          onChange={(value) => dispatch({
                            key: name,
                            value: (value === '' ? undefined : value) as unknown as T[keyof T]
                          })}
                          onKeyDown={onEnterKey}
                          options={options.map(({ id }) => id)}
                          required={required}
                          value={`${state[name] ?? ''}`}
                        />
                      )
                    })()}
                    {type === 'string' && !useOptions && (
                      <TextField
                        disabled={isDisabled}
                        fullWidth
                        label={label}
                        onChange={(e) => {
                          const value = getTargetValue(e)
                          dispatch({
                            key: name,
                            value: (value === '' ? undefined : value) as unknown as T[keyof T]
                          })
                        }}
                        onKeyDown={onEnterKey}
                        required={required}
                        size='small'
                        type='text'
                        value={state[name] ?? ''}
                      />
                    )}
                    {type === 'number' && !useConstantOption && (
                      <TextField
                        disabled={isDisabled}
                        fullWidth
                        label={label}
                        onChange={(e) => {
                          const value = getTargetValue(e)
                          const parsed = parseFloat(value)
                          dispatch({
                            key: name,
                            value: (Number.isNaN(parsed) ? undefined : parsed) as unknown as T[keyof T]
                          })
                        }}
                        onKeyDown={onEnterKey}
                        required={required}
                        size='small'
                        type='number'
                        value={`${state[name] ?? ''}`}
                      />
                    )}
                    {type === 'number' && useConstantOption && (() => {
                      // These is OK because the fields can't change at runtime
                      // and will always run in exactly the same order

                      /* eslint-disable react-hooks/rules-of-hooks */
                      const { label: constantLabel, constantValue, value: valueWhenConstant } = useConstantOption()
                      /* eslint-enable react-hooks/rules-of-hooks */

                      const value = state[name]

                      return (
                        <>
                          <TextField
                            disabled={value === valueWhenConstant || isDisabled}
                            label={label}
                            onChange={(e) => {
                              const value = getTargetValue(e)
                              const parsed = parseFloat(value)
                              dispatch({
                                key: name,
                                value: (Number.isNaN(parsed) ? undefined : parsed) as unknown as T[keyof T]
                              })
                            }}
                            onKeyDown={onEnterKey}
                            required={required}
                            size='small'
                            sx={{ width: '100px', mr: 1 }}
                            type='number'
                            value={`${value === valueWhenConstant ? constantValue : value ?? ''}`}
                          />
                          <FormControlLabel label={constantLabel} control={
                            <Checkbox checked={value === null} onChange={(e) => {
                              const isChecked = getTargetChecked(e)
                              dispatch({
                                key: name,
                                value: (isChecked ? valueWhenConstant : constantValue) as unknown as T[keyof T]
                              })
                            }} />
                          } />
                        </>
                      )
                    })()}
                    {type === 'yyyymm' && !useConstantOption && (
                      <DatePicker
                        disabled={isDisabled}
                        label={label}
                        onChange={(value) => dispatch({
                          key: name,
                          value: (isDate(value) ? toYYYYMM(value) : undefined) as unknown as T[keyof T]
                        })}
                        renderInput={(props: TextFieldProps) => (
                          <TextField
                            {...props}
                            fullWidth
                            onKeyDown={onEnterKey}
                            required={required}
                            size='small'
                          />
                        )}
                        value={state[name] ? fromYYYYMM(state[name] as unknown as YYYYMM) : null}
                        views={['month', 'year']}
                      />
                    )}
                    {type === 'yyyymm' && useConstantOption && (() => {
                      // These is OK because the fields can't change at runtime
                      // and will always run in exactly the same order

                      /* eslint-disable react-hooks/rules-of-hooks */
                      const { label: constantLabel, constantValue, value: valueWhenConstant } = useConstantOption()
                      /* eslint-enable react-hooks/rules-of-hooks */

                      const value = state[name]

                      return (
                        <>
                          <DatePicker
                            disabled={value === valueWhenConstant || isDisabled}
                            label={label}
                            onChange={(value) => dispatch({
                              key: name,
                              value: (isDate(value) ? toYYYYMM(value) : undefined) as unknown as T[keyof T]
                            })}
                            renderInput={(props: TextFieldProps) => (
                              <TextField
                                {...props}
                                fullWidth
                                onKeyDown={onEnterKey}
                                required={required}
                                size='small'
                              />
                            )}
                            value={value === valueWhenConstant ? fromYYYYMM(constantValue as unknown as YYYYMM) : value ? fromYYYYMM(value as unknown as YYYYMM) : null}
                            views={['month', 'year']}
                          />
                          <FormControlLabel label={constantLabel} control={
                            <Checkbox checked={value === valueWhenConstant} disabled={isDisabled} onChange={(e) => {
                              const isChecked = getTargetChecked(e)
                              dispatch({
                                key: name,
                                value: (isChecked ? valueWhenConstant : constantValue) as unknown as T[keyof T]
                              })
                            }} />
                          } />
                        </>
                      )
                    })()}
                    {type === 'boolean' && (
                      <FormControlLabel
                        label={label}
                        control={
                          <Checkbox
                            checked={state[name] as unknown as boolean ?? false}
                            disabled={isDisabled}
                            onChange={(e) => {
                              const isChecked = getTargetChecked(e)
                              dispatch({
                                key: name,
                                value: isChecked as unknown as T[keyof T]
                              })
                            }} />
                        } />
                    )}
                  </IconField>
                )
              })
            }
          </DialogContent>
          <DialogActions sx={{ ml: 2, mr: 2 }}>
            {onDelete && <Button color='error' endIcon={<Delete />} onClick={onDeleteClick} sx={{ marginRight: 'auto' }}>Delete</Button>}
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onDoneClick} disabled={!isValid} variant='contained'>{title}</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  })

  return EntityDialog
}