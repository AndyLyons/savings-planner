import { Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/lab';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, TextFieldProps
} from '@mui/material';
import { cloneElement, ReactElement, useCallback, useReducer } from 'react';
import { isDate, toYYYYMM, toYYYYMMDD } from '../../utils/date';
import { getChangeEventState, useKeyPress, useStopEvent } from '../../utils/hooks';
import { Autocomplete, IconField } from '../mui';

type FieldType = 'string' | 'number' | 'selectSearch' | 'yyyymmdd' | 'yyyymm'

interface BaseField {
  type: FieldType
  icon: ReactElement
  label: string
  name: string
  required?: boolean
}

interface StringField extends BaseField {
  type: 'string'
}

interface SelectSearchField<T extends string = string> extends BaseField {
  type: 'selectSearch'
  useOptions: () => Array<{ id: T, label: string }>
}

interface NumberField extends BaseField {
  type: 'number'
}

interface YYYYMMDDField extends BaseField {
  type: 'yyyymmdd'
}

interface YYYYMMField extends BaseField {
  type: 'yyyymm'
}

type Field = StringField | SelectSearchField | NumberField | YYYYMMDDField | YYYYMMField

interface Action {
  fieldName: string
  value: unknown
}

type FormState = Partial<{
  [key: string]: unknown
}>

export function createEntityDialog<T>(name: string, icon: ReactElement, fields: Array<Field>) {
  const iconWithMargin = cloneElement(icon, { sx: { mr: 2, ...icon.props.sx } })

  function reducer(state: FormState, action: Action) {
    return {
      ...state,
      [action.fieldName]: action.value
    }
  }

  const verifyState = (state: FormState) =>
    fields.every(({ name, required }) => !required || state[name] !== null)

  function normaliseState(state: FormState) {
    const normalise = {
      string: (value) => value === '' ? null : value,
      number: (value) => {
        const parsed = parseFloat(value as string)
        return Number.isNaN(parsed) ? null : parsed
      },
      yyyymm: (value) => isDate(value) ? toYYYYMM(value) : null,
      yyyymmdd: (value) => isDate(value) ? toYYYYMMDD(value) : null,
      selectSearch: (value) => value === '' ? null : value
    } as Record<Field['type'], (value: unknown) => unknown>

    return fields.reduce((acc, { name, type }) => {
      acc[name] = normalise[type] ? normalise[type](state[name]) : state[name]
      return acc
    }, {} as FormState)
  }

  interface Props {
    initialValues: FormState,
    onClose: () => void,
    onDelete?: () => void
    onDone: (details: T) => void
  }

  return function EntityDialog({ initialValues, onClose, onDelete, onDone }: Props) {
    const [state, dispatch] = useReducer(reducer, initialValues)
    const normalisedState = normaliseState(state)
    const isValid = verifyState(normalisedState)

    const onDoneClick = useStopEvent(() => {
      if (isValid) {
        onDone(normalisedState as unknown as T)
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
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>{iconWithMargin} {onDelete ? 'Edit' : 'Create'} {name}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
            {
              fields.map((field, index) => {
                const { type, icon, label, name, required } = field
                return (
                  <IconField key={name} icon={icon} sx={{ mt: index === 0 ? 1 : 0, mb: index < fields.length ? 2 : 0 }}>
                    {['string', 'number'].includes(type) && (
                      <TextField
                        fullWidth
                        label={label}
                        onChange={(e) => dispatch({
                          fieldName: name,
                          value: getChangeEventState(e)
                        })}
                        onKeyDown={onEnterKey}
                        required={required}
                        size='small'
                        type={type === 'number' ? 'number' : 'text'}
                        value={state[name]}
                      />
                    )}
                    {['yyyymm', 'yyyymmdd'].includes(type) && (
                      <DatePicker
                        label={label}
                        onChange={(value) => dispatch({
                          fieldName: name,
                          value
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
                        value={state[name]}
                        views={type === 'yyyymm' ? ['year', 'month'] : undefined}
                      />
                    )}
                    {type === 'selectSearch' && (() => {
                      const options = field.useOptions()
                      return (
                        <Autocomplete
                          label={label}
                          getOptionLabel={(labelId) => options.find(({ id }) => id === labelId)?.label ?? ''}
                          onChange={(value) => dispatch({
                            fieldName: name,
                            value
                          })}
                          onKeyDown={onEnterKey}
                          options={options.map(({ id }) => id)}
                          required={required}
                          value={state[name] as string}
                        />
                      )
                    })()}
                  </IconField>
                )
              })
            }
          </DialogContent>
          <DialogActions sx={{ ml: 2, mr: 2 }}>
            {onDelete && <Button color='error' endIcon={<Delete />} onClick={onDeleteClick} sx={{ marginRight: 'auto' }}>Delete</Button>}
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onDoneClick} disabled={!isValid} variant='contained'>Create</Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }
}