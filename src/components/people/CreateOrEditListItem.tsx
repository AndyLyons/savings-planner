import { ChangeEvent, KeyboardEventHandler, useState, useCallback } from 'react'
import { Box, IconButton, ListItem, ListItemIcon, TextField, TextFieldProps } from '@mui/material';
import { DatePicker } from '@mui/lab'
import { Close, Done, Person } from '@mui/icons-material';
import { PersonDetails } from '../../state/app';
import { toYYYYMMDD, isDate, fromYYYYMMDD, YYYYMMDD } from '../../utils/date';
import { useNavigateTo } from '../../utils/router';

interface Props {
    initialName?: string
    initialDob?: YYYYMMDD | null
    onDone: (details: PersonDetails) => void
}

export function CreateOrEditListItem({ initialName = '', initialDob = null, onDone }: Props) {
  const [name, setName] = useState(initialName)
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(initialDob ? fromYYYYMMDD(initialDob) : initialDob)

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
    case 'Escape':
      navigateToPeople()
      break
    }
  }, [onDoneClick, navigateToPeople])

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
    <ListItem sx={{ pl: 4, pt: 1.7, pb: 1.7 }}>
      <ListItemIcon>
        <Person />
      </ListItemIcon>
      <TextField
        autoFocus={true}
        error={!isValidName}
        label='Name'
        onChange={onNameChange}
        onKeyDown={onKeyDown}
        size='small'
        value={name}
        variant='standard'
      />
      <Box sx={{ mr: 4 }}>
        <DatePicker
          label='Date of birth'
          onChange={setDateOfBirth}
          renderInput={renderDatePickerInput}
          value={dateOfBirth}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <ListItemIcon>
        <IconButton onClick={onDoneClick} disabled={!isValid}><Done /></IconButton>
      </ListItemIcon>
      <ListItemIcon>
        <IconButton onClick={navigateToPeople}><Close /></IconButton>
      </ListItemIcon>
    </ListItem>
  )
}