import { Delete, Event, ShortText } from '@mui/icons-material';
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
import { useNavigateTo } from '../../utils/router';
import { IconField } from '../mui';

interface Props {
    id?: PersonId,
    onDone: (details: Person) => void,
    action: string
}

export function CreateOrEditPerson({ id, onDone, action }: Props) {
  const person = useSelector(state => id ? state.people[id] : null, [id])
  const removePerson = useSelector(state => state.removePerson)
  const navigateToPeople = useNavigateTo('/people')

  const [name, onNameChange] = useChangeEventState(person?.name ?? '')
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(person?.dob ? fromYYYYMMDD(person?.dob) : null)

  const isValidName = name !== ''
  const isValidDate = isDate(dateOfBirth)
  const isValid = isValidName && isValidDate

  const savePerson = useCallback(() => {
    if (isValid) {
      onDone({ name, dob: toYYYYMMDD(dateOfBirth) })
      navigateToPeople()
    }
  }, [onDone, name, navigateToPeople, dateOfBirth, isValid])

  const onDoneClick = useStopEvent(savePerson)
  const onEnterKey = useKeyPress('Enter', onDoneClick)
  const onDeleteClick = useStopEvent(
    useCallback(() => {
      if (id) {
        removePerson(id)
        navigateToPeople()
      }
    }, [id, navigateToPeople, removePerson])
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
      <Dialog fullWidth maxWidth='xs' open onClose={navigateToPeople}>
        <DialogTitle>{action} person</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <IconField icon={<ShortText />} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label='Name'
              onChange={onNameChange}
              onKeyDown={onEnterKey}
              size='small'
              value={name}
              sx={{ mb: 2 }}
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
          {id && <Button color='error' endIcon={<Delete />} onClick={onDeleteClick} sx={{ marginRight: 'auto' }}>Delete</Button>}
          <Button onClick={navigateToPeople}>Cancel</Button>
          <Button onClick={onDoneClick} disabled={!isValid} variant='contained'>{action}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}