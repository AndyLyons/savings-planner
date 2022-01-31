import { DatePicker } from '@mui/lab';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, TextFieldProps
} from '@mui/material';
import { useCallback, useState } from 'react';
import { Person } from '../../state/slices/people';
import { fromYYYYMMDD, isDate, toYYYYMMDD, YYYYMMDD } from '../../utils/date';
import { useStopPropagation } from '../../utils/hooks';
import { useNavigateTo } from '../../utils/router';

interface Props {
    initialName?: string
    initialDob?: YYYYMMDD | null
    onDone: (details: Person) => void,
    action: string
}

export function CreateOrEditPerson({ initialName = '', initialDob = null, onDone, action }: Props) {
  const [name, setName] = useState(initialName)
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(initialDob ? fromYYYYMMDD(initialDob) : null)

  const isValidName = name !== ''
  const isValidDate = isDate(dateOfBirth)
  const isValid = isValidName && isValidDate

  const navigateToPeople = useNavigateTo('/people')

  const onNameChange = useCallback((e: { target: { value: string } }) => {
    setName(e.target.value)
  }, [])

  const savePerson = useCallback(() => {
    if (isValid) {
      onDone({ name, dob: toYYYYMMDD(dateOfBirth) })
      navigateToPeople()
    }
  }, [onDone, name, navigateToPeople, dateOfBirth, isValid])

  const onDoneClick = useStopPropagation(savePerson)

  const onKeyDown = useCallback(({ key }: { key: string }) => {
    switch (key) {
    case 'Enter':
      savePerson()
      break
    }
  }, [savePerson])

  const renderDatePickerInput = useCallback((props: TextFieldProps) => (
    <TextField
      {...props}
      onKeyDown={onKeyDown}
      error={!isValidDate}
      size='small'
      variant='standard'
    />
  ), [isValidDate, onKeyDown])

  return (
    <Dialog fullWidth maxWidth='lg' open onClose={navigateToPeople}>
      <DialogTitle>{action} person</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <TextField
          autoFocus={true}
          error={!isValidName}
          label='Name'
          onChange={onNameChange}
          onKeyDown={onKeyDown}
          size='small'
          value={name}
          variant='standard'
          sx={{ mb: 2 }}
        />
        <DatePicker
          label='Date of birth'
          onChange={setDateOfBirth}
          renderInput={renderDatePickerInput}
          value={dateOfBirth}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={navigateToPeople}>Cancel</Button>
        <Button onClick={onDoneClick} disabled={!isValid}>{action}</Button>
      </DialogActions>
    </Dialog>
  )
}