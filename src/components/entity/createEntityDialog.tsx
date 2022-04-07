import { Delete } from '@mui/icons-material'
import { DatePicker } from '@mui/lab'
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, TextFieldProps
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { cloneElement, ReactElement, useCallback, useReducer } from 'react'
import { fromYYYYMM, fromYYYYMMDD, isDate, toYYYYMM, toYYYYMMDD, YYYYMM, YYYYMMDD } from '../../utils/date'
import { entries, KeyValues } from '../../utils/fn'
import { getChangeEventState, useKeyPress, useStopEvent } from '../../utils/hooks'
import { Autocomplete, IconField } from '../mui'

type FieldType<T> =
  T extends YYYYMMDD ? 'yyyymmdd' :
  T extends YYYYMM ? 'yyyymm' :
  T extends string ? 'string' :
  T extends number ? 'number' :
  never

type Fields<T> = {
  [P in keyof Partial<T>]: {
    icon: ReactElement
    label: string
    required?: boolean
    type: FieldType<T[P]>
    useOptions?: () => Array<{ id: string, label: string }>
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
      return !config.required || state[name] != null
    })

  interface Props {
    initialValues?: Partial<T>
    onClose: () => void
    onDelete?: () => void
    onDone: (details: T) => void
  }

  const EntityDialog = observer(function EntityDialog({ initialValues, onClose, onDelete, onDone }: Props) {
    const title = onDelete ? 'Edit' : 'Create'

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
                const { type, icon, label, required, useOptions } = field
                return (
                  <IconField key={`${name}`} icon={icon} sx={{ mt: index === 0 ? 1 : 0, mb: index < fieldEntries.length ? 2 : 0 }}>
                    {type === 'string' && useOptions && (() => {
                      // This is OK because the fields can't change at runtime
                      // and will always run in exactly the same order
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      const options = useOptions()
                      return (
                        <Autocomplete
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
                        fullWidth
                        label={label}
                        onChange={(e) => {
                          const value = getChangeEventState(e)
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
                    {type === 'number' && (
                      <TextField
                        fullWidth
                        label={label}
                        onChange={(e) => {
                          const value = getChangeEventState(e)
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
                    {type === 'yyyymm' && (
                      <DatePicker
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
                        views={['year', 'month']}
                      />
                    )}
                    {type === 'yyyymmdd' && (
                      <DatePicker
                        label={label}
                        onChange={(value) => dispatch({
                          key: name,
                          value: (isDate(value) ? toYYYYMMDD(value) : null) as unknown as T[keyof T]
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
                        value={state[name] ? fromYYYYMMDD(state[name] as unknown as YYYYMMDD) : null}
                      />
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