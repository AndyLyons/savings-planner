import { ChangeEvent, KeyboardEventHandler, useState, useCallback } from 'react'
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, TextFieldProps
} from '@mui/material';
import { DatePicker } from '@mui/lab'
import { PersonDetails } from '../../state/app';
import { toYYYYMMDD, isDate, fromYYYYMMDD, YYYYMMDD } from '../../utils/date';
import { useNavigateTo } from '../../utils/router';

interface Props {
    initialName?: string
    initialDob?: YYYYMMDD | null
    onDone: (details: PersonDetails) => void,
    action: string
}

export function CreateOrEditDialog({ initialName = '', initialDob = null, onDone, action }: Props) {
  const [name, setName] = useState(initialName)
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(initialDob ? fromYYYYMMDD(initialDob) : null)

  const isValidName = name !== ''
  const isValidDate = isDate(dateOfBirth)
  const isValid = isValidName && isValidDate

  const navigateToPeople = useNavigateTo('/people')

  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setName(e.target.value)
  }, [])

  const onDoneClick = useCallback(() => {
    if (isValid) {
      onDone({ name, dob: toYYYYMMDD(dateOfBirth) })
      navigateToPeople()
    }
  }, [onDone, name, navigateToPeople, dateOfBirth, isValid])

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(({ key }) => {
    switch (key) {
    case 'Enter':
      onDoneClick()
      break
    }
  }, [onDoneClick])

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
    <Dialog open onClose={navigateToPeople}>
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