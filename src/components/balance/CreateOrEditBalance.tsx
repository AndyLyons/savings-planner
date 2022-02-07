import { AccountBalance, CurrencyPound, Delete, Event, ShortText } from '@mui/icons-material';
import { DatePicker } from '@mui/lab';
import {
  Autocomplete,
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, InputAdornment, TextField, TextFieldProps
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useSelector } from '../../state/app';
import { isAccountId, useIsAccountId } from '../../state/slices/accounts';
import { Balance, BalanceId } from '../../state/slices/balances';
import { fromYYYYMM, isDate, toYYYYMM } from '../../utils/date';
import { useBoolean, useChangeEventState, useEventState, useKeyPress, useStopEvent } from '../../utils/hooks';
import { IconField } from '../mui';

const getAutocompleteId = (_: unknown, id: string) => id

interface Props {
  action: string,
  id?: BalanceId,
  onClose: () => void,
  onDone: (details: Balance) => void
}

export function CreateOrEditBalance({ id, onClose, onDone, action }: Props) {
  const balance = useSelector(state => id ? state.balances[id] : null, [id])
  const accountsIds = useSelector(state => state.accountsIds)
  const accounts = useSelector(state => state.accounts)
  const people = useSelector(state => state.people)
  const removeBalance = useSelector(state => state.removeBalance)

  const [account, onAccountChange] = useEventState(balance?.account ?? '', getAutocompleteId)
  const [value, onValueChange] = useChangeEventState(`${balance?.value ?? 0}`)
  const [date, setDate] = useState<Date | null>(balance?.date ? fromYYYYMM(balance?.date) : null)
  const [isAccountOpen, setAccountOpen, setAccountClosed] = useBoolean(false)

  const isValidAccount = useIsAccountId(account)
  const isValidValue = value !== ''
  const isValidDate = isDate(date)
  const isValid = isValidAccount && isValidValue && isValidDate

  const getAccountName = useCallback(
    (id: string) => isAccountId(id, accounts) ? `${accounts[id].name} (${people[accounts[id].owner].name})` : '',
    [accounts, people]
  )

  const saveBalance = useCallback(() => {
    if (isValid) {
      onDone({ account, date: toYYYYMM(date), value: parseFloat(value) })
      onClose()
    }
  }, [onClose, onDone, account, value, date, isValid])

  const onDoneClick = useStopEvent(saveBalance)
  const onEnterKey = useKeyPress('Enter', onDoneClick)
  const onDeleteClick = useStopEvent(
    useCallback(() => {
      if (id) {
        removeBalance(id)
        onClose()
      }
    }, [id, onClose, removeBalance])
  )

  const renderDatePickerInput = useCallback((props: TextFieldProps) => (
    <TextField
      {...props}
      fullWidth
      onKeyDown={onEnterKey}
      size='small'
    />
  ), [onEnterKey])

  return (
    <>
      <Dialog fullWidth maxWidth='xs' open onClose={onClose}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}><CurrencyPound sx={{ mr: 2 }} /> {action} balance</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <IconField icon={<AccountBalance />} sx={{ mb: 2 }}>
            <Autocomplete
              autoHighlight
              disableClearable
              fullWidth
              getOptionLabel={getAccountName}
              onChange={onAccountChange}
              onClose={setAccountClosed}
              onOpen={setAccountOpen}
              openOnFocus
              options={accountsIds}
              renderInput={(params) =>
                <TextField
                  {...params}
                  label='Account'
                  onKeyDown={isAccountOpen ? undefined : onEnterKey}
                  required
                  size='small'
                />
              }
              value={account}
            />
          </IconField>
          <IconField icon={<ShortText />} sx={{ mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">£</InputAdornment>
              }}
              label='Balance'
              onChange={onValueChange}
              onKeyDown={onEnterKey}
              size='small'
              type='number'
              value={value}
            />
          </IconField>
          <IconField icon={<Event />}>
            <DatePicker
              label='Date'
              onChange={setDate}
              renderInput={renderDatePickerInput}
              value={date}
              views={['year', 'month']}
            />
          </IconField>
        </DialogContent>
        <DialogActions sx={{ ml: 2, mr: 2 }}>
          {id && <Button color='error' endIcon={<Delete />} onClick={onDeleteClick} sx={{ marginRight: 'auto' }}>Delete</Button>}
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onDoneClick} disabled={!isValid} variant='contained'>{action}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}