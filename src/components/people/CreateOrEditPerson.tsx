import { Delete, Event, Person as PersonIcon, ShortText } from '@mui/icons-material';
import { DatePicker } from '@mui/lab';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, TextFieldProps
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useSelector } from '../../state/app';
import { Person, PersonId } from '../../state/slices/people';
import { fromYYYYMMDD, isDate, toYYYYMMDD } from '../../utils/date';
import { useChangeEventState, useKeyPress, useStopEvent } from '../../utils/hooks';
import { IconField } from '../mui';

interface Props {
  action: string,
  id?: PersonId,
  onClose: () => void,
  onDone: (details: Person) => void
}

export function CreateOrEditPerson({ id, onClose, onDone, action }: Props) {
  const person = useSelector(state => id ? state.people[id] : null, [id])
  const hasAccounts = useSelector(
    state => id && state.accountsIds.some(accountId => state.accounts[accountId].owner === id),
    [id]
  )
  const removePerson = useSelector(state => state.removePerson)

  const [name, onNameChange] = useChangeEventState(person?.name ?? '')
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(person?.dob ? fromYYYYMMDD(person?.dob) : null)

  const isValidName = name !== ''
  const isValidDate = isDate(dateOfBirth)
  const isValid = isValidName && isValidDate

  const savePerson = useCallback(() => {
    if (isValid) {
      onDone({ name, dob: toYYYYMMDD(dateOfBirth) })
      onClose()
    }
  }, [onDone, name, onClose, dateOfBirth, isValid])

  const onDoneClick = useStopEvent(savePerson)
  const onEnterKey = useKeyPress('Enter', onDoneClick)
  const onDeleteClick = useStopEvent(
    useCallback(() => {
      if (id) {
        removePerson(id)
        onClose()
      }
    }, [id, onClose, removePerson])
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}><PersonIcon sx={{ mr: 2 }} /> {action} person</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <IconField icon={<ShortText />} sx={{ mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              label='Name'
              onChange={onNameChange}
              onKeyDown={onEnterKey}
              size='small'
              value={name}
            />
          </IconField>
          <IconField icon={<Event />}>
            <DatePicker
              label='Date of birth'
              onChange={setDateOfBirth}
              renderInput={renderDatePickerInput}
              value={dateOfBirth}
            />
          </IconField>
        </DialogContent>
        <DialogActions sx={{ ml: 2, mr: 2 }}>
          {id && <Button color='error' disabled={hasAccounts} endIcon={<Delete />} onClick={onDeleteClick} sx={{ marginRight: 'auto' }}>Delete</Button>}
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onDoneClick} disabled={!isValid} variant='contained'>{action}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}