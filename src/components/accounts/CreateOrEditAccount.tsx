import { ChangeEvent, KeyboardEventHandler, useState, useCallback } from 'react'
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, InputLabel, MenuItem,
  Select, SelectChangeEvent, TextField
} from '@mui/material';
import { Account } from '../../state/slices/accounts';
import { PersonId, useIsPersonId } from '../../state/slices/people';
import { useIsDesktop } from '../../utils/breakpoints';
import { useNavigateTo } from '../../utils/router';
import { useSelector } from '../../state/app';

interface Props {
    initialName?: string
    initialOwner?: string
    onDone: (details: Account) => void,
    action: string
}

export function CreateOrEditAccount({ initialName = '', initialOwner = '', onDone, action }: Props) {
  const isDesktop = useIsDesktop()

  const [name, setName] = useState(initialName)
  const [owner, setOwner] = useState<string>(initialOwner)

  const peopleIds = useSelector(state => state.peopleIds)
  const people = useSelector(state => state.people)

  const isValidName = name !== ''
  const isValidOwner = useIsPersonId(owner)
  const isValid = isValidName && isValidOwner

  const navigateToAccounts = useNavigateTo('/accounts')

  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setName(e.target.value)
  }, [])

  const onOwnerChange = useCallback((e: SelectChangeEvent<PersonId | ''>) => {
    setOwner(e.target.value)
  }, [])

  const onDoneClick = useCallback(() => {
    if (isValid) {
      onDone({ name, owner })
      navigateToAccounts()
    }
  }, [onDone, name, owner, navigateToAccounts, isValid])

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(({ key }) => {
    switch (key) {
    case 'Enter':
      onDoneClick()
      break
    }
  }, [onDoneClick])

  return (
    <Dialog open onClose={navigateToAccounts}>
      <DialogTitle>{action} account</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <TextField
          autoFocus={true}
          error={!isValidName}
          label='Name'
          onChange={onNameChange}
          onKeyDown={onKeyDown}
          required
          size='small'
          value={name}
          variant='standard'
          sx={{ mb: 2 }}
        />
        <FormControl
          error={!isValidOwner}
          fullWidth
          required
          size='small'
          variant='standard'
        >
          <InputLabel id="owner-select-label">Owner</InputLabel>
          <Select
            id='owner-select'
            labelId='owner-select-label'
            label='Owner'
            native={!isDesktop}
            onChange={onOwnerChange}
            value={isValidOwner ? owner : ''}
          >
            {peopleIds.map((id) => <MenuItem key={id} value={id}>{people[id].name}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={navigateToAccounts}>Cancel</Button>
        <Button onClick={onDoneClick} disabled={!isValid}>{action}</Button>
      </DialogActions>
    </Dialog>
  )
}