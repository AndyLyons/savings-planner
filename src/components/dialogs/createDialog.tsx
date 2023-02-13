import { Add, Delete } from '@mui/icons-material'
import { DatePicker } from '@mui/lab'
import {
  Box,
  Button, Checkbox, Dialog as MUIDialog, DialogActions, DialogContent,
  DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Radio, RadioGroup, TextField, TextFieldProps, Typography
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import React, { cloneElement, Fragment, ReactElement, useReducer, useState } from 'react'
import type { DialogType } from '../../state/Dialogs'
import type { Store } from '../../state/Store'
import { useIsDesktop } from '../../utils/breakpoints'
import { fromYYYY, fromYYYYMM, isDate, toYYYY, toYYYYMM, YYYY, YYYYMM } from '../../utils/date'
import { entries, KeyValues } from '../../utils/fn'
import { getTargetChecked, getTargetValue, useKeyPress, useStopEvent } from '../../utils/hooks'
import { useStore } from '../../utils/mobx'
import { Autocomplete, IconField } from '../mui'

type FieldType<T, V> =
  V extends YYYY ? {
    type: 'yyyy'
  } | {
    type: 'duration'
    getFrom: (store: Store, state: T) => YYYY
  } :
  V extends YYYYMM ? {
    type: 'yyyymm'
  } :
  V extends string ? {
    type: 'string'
    useOptions?: () => Array<{ id: string, label: string }>
  } :
  V extends number ? {
    type: 'number'
  } :
  V extends boolean ? {
    type: 'boolean'
  } :
  V extends Array<infer U> ? {
    type: 'collection'
    itemIcon: ReactElement
    dialogType: DialogType
    getKey: (store: Store, entity: U) => string
    getLabel: (store: Store, entity: U) => string
  } :
  never

type FormField<T, K extends keyof T> = FieldType<T, T[K]> & {
  autoFocus?: boolean
  icon: ReactElement | ((state: T) => ReactElement)
  label: string | ((state: T) => string)
  readonly?: boolean
  required?: boolean
  useConstantOption?: () => { label: string, value: T[K], constantValue: T[K] }
  getVisible?: (state: T) => boolean
}

type GenerateField<T> = {
  type: 'generate'
  generate: () => T
}

type Field<T, K extends keyof T> = null | GenerateField<T[K]> | FormField<T, K>

type Fields<T> = {
  [P in keyof T]: Field<T, P>
}

const isGenerateFieldEntry = <T, K extends keyof T>(entry: [K, Field<T, K>]): entry is [K, GenerateField<T[K]>] => {
  const [, field] = entry
  return field !== null && field.type === 'generate'
}

export function createDialog<T>(name: string, icon: ReactElement, fields: Fields<T>, defaults: Partial<T> = {}) {
  const fieldEntries = entries(fields)

  const iconWithMargin = cloneElement(icon, { sx: { mr: 2, ...icon.props.sx } })

  function reducer(state: T, action: KeyValues<T>) {
    return {
      ...state,
      [action.key]: action.value
    } as T
  }

  const verifyState = (state: T): state is T =>
    fieldEntries.every(([name, field]) => {
      const isHidden = field === null || field.type === 'generate' || (field.getVisible && !field.getVisible(state))
      return isHidden || !field.required || state[name] !== undefined
    })

  interface Props {
    initialValues: Partial<T>
    onClose: () => void
    onDelete?: () => void
    onDone: (details: T) => void
  }

  return observer(function Dialog({ initialValues, onClose, onDelete, onDone }: Props) {
    const store = useStore()

    const isEdit = Boolean(onDelete)
    const title = isEdit ? 'Edit' : 'Create'
    const action = isEdit ? 'Save' : 'Create'

    const generatedValues = fieldEntries
      .filter(isGenerateFieldEntry)
      .reduce((acc, [name, field]) => {
        acc[name] = field.generate()
        return acc
      }, {} as Partial<T>)

    const [state, dispatch] = useReducer(reducer, {
      ...defaults,
      ...generatedValues,
      ...initialValues
    } as T)
    const isValid = verifyState(state)

    const onDoneClick = useStopEvent(() => {
      if (isValid) {
        onDone(state)
        onClose()
      }
    })

    const onEnterKey = useKeyPress('Enter', onDoneClick)
    const onDeleteClick = useStopEvent(() => {
      onDelete?.()
      onClose()
    })

    return (
      <MUIDialog fullWidth maxWidth='md' open onClose={onClose}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>{iconWithMargin} {title} {name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', pb: 0 }}>
          <Box sx={{ mt: 1 }} />
          {
            fieldEntries.map(([name, field]) => {
              if (field === null || field.type === 'generate') {
                return null
              }

              const { type, icon: iconGetter, label: labelGetter, autoFocus, readonly, required, getVisible, useConstantOption } = field

              const icon = typeof iconGetter === 'function' ? iconGetter(state) : iconGetter
              const label = typeof labelGetter === 'function' ? labelGetter(state) : labelGetter

              // Fields are static at runtime - this will either always be called
              // or never be called and wont change each render
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const isVisible = getVisible ? getVisible(state) : true
              const isDisabled = !isVisible || (isEdit && readonly)

              function FieldWrapper({ children }: React.PropsWithChildren<{}>) {
                return (
                  <IconField
                    key={`${name}`}
                    icon={icon}
                    sx={isVisible ? {} : { display: 'none' }}
                  >
                    {children}
                  </IconField>
                )
              }

              return (
                <Fragment key={String(name)}>
                  {type === 'string' && field.useOptions && (() => {
                    // This is OK because the fields can't change at runtime
                    // and will always run in exactly the same order
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const options = field.useOptions()

                    return (
                      <FieldWrapper>
                        <Autocomplete
                          autoFocus={autoFocus}
                          disabled={isDisabled}
                          label={label}
                          getOptionLabel={(optionId) => options.find(({ id }) => id === optionId)?.label ?? ''}
                          onChange={(value) => {
                            dispatch({
                              key: name,
                              value: value as unknown as T[keyof T]
                            })
                          }}
                          onKeyDown={onEnterKey}
                          options={options.map(({ id }) => id)}
                          required={required}
                          // null is not a string - but Autocomplete uses null for empty value
                          // even though it's typed to take only a string
                          value={(state[name] !== undefined ? `${state[name]}` : null) as string}
                        />
                      </FieldWrapper>
                    )
                  })()}
                  {type === 'string' && !field.useOptions && (
                    <FieldWrapper>
                      <TextField
                        autoFocus={autoFocus}
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
                    </FieldWrapper>
                  )}
                  {type === 'number' && !useConstantOption && (
                    <FieldWrapper>
                      <TextField
                        autoFocus={autoFocus}
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
                    </FieldWrapper>
                  )}
                  {type === 'number' && useConstantOption && (() => {
                    // These is OK because the fields can't change at runtime
                    // and will always run in exactly the same order

                    /* eslint-disable react-hooks/rules-of-hooks */
                    const { label: constantLabel, constantValue, value: valueWhenConstant } = useConstantOption()
                    /* eslint-enable react-hooks/rules-of-hooks */

                    const value = state[name]

                    return (
                      <FieldWrapper>
                        <TextField
                          autoFocus={autoFocus}
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
                      </FieldWrapper>
                    )
                  })()}
                  {type === 'yyyy' && !useConstantOption && (
                    <FieldWrapper>
                      <DatePicker
                        disabled={isDisabled}
                        label={label}
                        onChange={(value) => dispatch({
                          key: name,
                          value: (isDate(value) ? toYYYY(value) : undefined) as unknown as T[keyof T]
                        })}
                        renderInput={(props: TextFieldProps) => (
                          <TextField
                            {...props}
                            autoFocus={autoFocus}
                            fullWidth
                            onKeyDown={onEnterKey}
                            required={required}
                            size='small'
                          />
                        )}
                        value={state[name] ? fromYYYY(state[name] as unknown as YYYY) : null}
                        views={['year']}
                      />
                    </FieldWrapper>
                  )}
                  {type === 'yyyy' && useConstantOption && (() => {
                    // These is OK because the fields can't change at runtime
                    // and will always run in exactly the same order

                    /* eslint-disable react-hooks/rules-of-hooks */
                    const { label: constantLabel, constantValue, value: valueWhenConstant } = useConstantOption()
                    /* eslint-enable react-hooks/rules-of-hooks */

                    const value = state[name]

                    return (
                      <FieldWrapper>
                        <DatePicker
                          disabled={value === valueWhenConstant || isDisabled}
                          label={label}
                          onChange={(value) => dispatch({
                            key: name,
                            value: (isDate(value) ? toYYYY(value) : undefined) as unknown as T[keyof T]
                          })}
                          renderInput={(props: TextFieldProps) => (
                            <TextField
                              {...props}
                              autoFocus={autoFocus}
                              fullWidth
                              onKeyDown={onEnterKey}
                              required={required}
                              size='small'
                            />
                          )}
                          value={value === valueWhenConstant ? fromYYYY(constantValue as unknown as YYYY) : value ? fromYYYY(value as unknown as YYYY) : null}
                          views={['year']}
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
                      </FieldWrapper>
                    )
                  })()}
                  {type === 'yyyymm' && !useConstantOption && (
                    <FieldWrapper>
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
                            autoFocus={autoFocus}
                            fullWidth
                            onKeyDown={onEnterKey}
                            required={required}
                            size='small'
                          />
                        )}
                        value={state[name] ? fromYYYYMM(state[name] as unknown as YYYYMM) : null}
                        views={['month', 'year']}
                      />
                    </FieldWrapper>
                  )}
                  {type === 'yyyymm' && useConstantOption && (() => {
                    // These is OK because the fields can't change at runtime
                    // and will always run in exactly the same order

                    /* eslint-disable react-hooks/rules-of-hooks */
                    const { label: constantLabel, constantValue, value: valueWhenConstant } = useConstantOption()
                    /* eslint-enable react-hooks/rules-of-hooks */

                    const value = state[name]

                    return (
                      <FieldWrapper>
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
                              autoFocus={autoFocus}
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
                      </FieldWrapper>
                    )
                  })()}
                  {type === 'duration' && (() => {
                    type Duration = 'date' | 'numYears'
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const [durationType, setDurationType] = useState<Duration>('date')

                    return (
                      <>
                        <FieldWrapper>
                          <FormControl sx={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FormLabel sx={{ marginRight: 1 }}>{label}</FormLabel>
                            <RadioGroup
                              onChange={e => setDurationType(e.target.value as Duration)}
                              row
                              value={durationType}
                            >
                              <FormControlLabel value='date' control={<Radio />} label="End date" />
                              <FormControlLabel value='numYears' control={<Radio />} label="Number of years" />
                            </RadioGroup>
                          </FormControl>
                        </FieldWrapper>
                        {durationType === 'date' && (
                          <DatePicker
                            disabled={isDisabled}
                            label='End date'
                            onChange={(value) => dispatch({
                              key: name,
                              value: (isDate(value) ? toYYYY(value) : undefined) as unknown as T[keyof T]
                            })}
                            renderInput={(props: TextFieldProps) => (
                              <TextField
                                {...props}
                                autoFocus={autoFocus}
                                fullWidth
                                onKeyDown={onEnterKey}
                                required={required}
                                size='small'
                              />
                            )}
                            value={state[name] ? fromYYYY(state[name] as unknown as YYYY) : null}
                            views={['year']}
                          />
                        )}
                        {durationType === 'numYears' && (
                          <TextField
                            autoFocus={autoFocus}
                            disabled={isDisabled}
                            fullWidth
                            label='Number of years'
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
                      </>
                    )
                  })()}
                  {type === 'boolean' && (
                    <FieldWrapper>
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
                    </FieldWrapper>
                  )}
                  {type === 'collection' && (() => {
                    const onCreate = () => store.dialogs.open({
                      type: field.dialogType,
                      initialValues: {},
                      onDone(details: unknown) {
                        dispatch({
                          key: name,
                          value: [...state[name] as unknown as Array<unknown>, details] as unknown as T[keyof T]
                        })
                      }
                    })

                    return (
                      <>
                        <FieldWrapper>
                          <Typography>{label}</Typography>
                          <IconButton onClick={onCreate} sx={{ ml: 1 }} size='small'><Add fontSize='inherit' /></IconButton>
                        </FieldWrapper>
                      </>
                    )
                  })()}
                  {type === 'collection' && (() => {
                    /* eslint-disable react-hooks/rules-of-hooks */

                    const isDesktop = useIsDesktop()
                    const items = (state[name] ?? []) as unknown as Array<unknown>

                    const onEdit = (item: any, index: number) => store.dialogs.open({
                      type: field.dialogType,
                      initialValues: item,
                      onDone(details: unknown) {
                        dispatch({
                          key: name,
                          value: [...items.slice(0, index), details, ...items.slice(index + 1)] as unknown as T[keyof T]
                        })
                      },
                      onDelete() {
                        dispatch({
                          key: name,
                          value: [...items.slice(0, index), ...items.slice(index + 1)] as unknown as T[keyof T]
                        })
                      }
                    })

                    /* eslint-enable react-hooks/rules-of-hooks */

                    return (
                      <List dense={isDesktop} sx={{ padding: 0 }}>
                        {items.map((item, i) => (
                          <ListItemButton key={field.getKey(store, item)} onClick={() => onEdit(item, i)} sx={{ pl: 4, justifyContent: 'flex-start' }}>
                            <ListItemIcon>{cloneElement(field.itemIcon, { fontSize: 'inherit' })}</ListItemIcon>
                            <ListItemText primary={<Typography component='span'>{field.getLabel(store, item)}</Typography>} />
                          </ListItemButton>
                        ))}
                      </List>
                    )
                  })()}
                  <Box sx={{ mb: 2 }} />
                </Fragment>
              )
            })
          }
        </DialogContent>
        <DialogActions sx={{ ml: 2, mr: 2 }}>
          {onDelete && <Button color='error' endIcon={<Delete />} onClick={onDeleteClick} sx={{ marginRight: 'auto' }}>Delete</Button>}
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onDoneClick} disabled={!isValid} variant='contained'>{action}</Button>
        </DialogActions>
      </MUIDialog>
    )
  })
}