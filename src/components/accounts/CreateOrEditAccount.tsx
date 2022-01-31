import { Percent, Person, ShortText } from '@mui/icons-material';
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useSelector } from '../../state/app';
import { Account } from '../../state/slices/accounts';
import { useIsPersonId } from '../../state/slices/people';
import { useStopPropagation } from '../../utils/hooks';
import { useNavigateTo } from '../../utils/router';
import { IconField, SelectField } from '../mui';

interface Props {
    initialAccount?: Account,
    onDone: (details: Account) => void,
    action: string
}

export function CreateOrEditAccount({ initialAccount, onDone, action }: Props) {
  const [name, setName] = useState(initialAccount?.name ?? '')
  const [owner, setOwner] = useState<string>(initialAccount?.owner ?? '')
  const [growth, setGrowth] = useState(`${initialAccount?.growth ?? 0}`)

  const peopleIds = useSelector(state => state.peopleIds)
  const people = useSelector(state => state.people)

  const isValidName = name !== ''
  const isValidOwner = useIsPersonId(owner)
  const isValidGrowth = !Number.isNaN(parseFloat(growth))
  const isValid = isValidName && isValidOwner && isValidGrowth

  const navigateToAccounts = useNavigateTo('/accounts')

  const onNameChange = useCallback((e: { target: { value: string } }) => {
    setName(e.target.value)
  }, [])

  const onGrowthChange = useCallback((e: { target: { value: string } }) => {
    setGrowth(e.target.value)
  }, [])

  const saveAccount = useCallback(() => {
    if (isValid) {
      onDone({ name, owner, growth: parseFloat(growth) })
      navigateToAccounts()
    }
  }, [onDone, name, owner, growth, navigateToAccounts, isValid])

  const onDoneClick = useStopPropagation(saveAccount)
  const onCancelClick = useStopPropagation(navigateToAccounts)

  const onKeyDown = useCallback(({ key }: { key: string }) => {
    switch (key) {
    case 'Enter':
      saveAccount()
      break
    }
  }, [saveAccount])

  return (
    <Dialog fullWidth maxWidth='xs' open onClose={navigateToAccounts}>
      <DialogTitle sx={{ pb: 1 }}>{action} account</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <IconField icon={<ShortText />} sx={{ mt: 1, mb: 2 }}>
          <TextField
            autoFocus={true}
            label='Name'
            onChange={onNameChange}
            onKeyDown={onKeyDown}
            required
            size='small'
            value={name}
          />
        </IconField>
        <IconField icon={<Person />} sx={{ mb: 2 }}>
          <SelectField
            fullWidth
            label='Owner'
            onChange={setOwner}
            options={peopleIds.map(id => ({ value: id, label: people[id].name }))}
            required
            size='small'
            value={owner}
          />
        </IconField>
        <IconField icon={<Percent />} sx={{ mb: 2 }}>
          <TextField
            error={!isValidGrowth}
            fullWidth
            label='Growth rate'
            onChange={onGrowthChange}
            onKeyDown={onKeyDown}
            required
            size='small'
            value={growth}
          />
        </IconField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick}>Cancel</Button>
        <Button onClick={onDoneClick} disabled={!isValid}>{action}</Button>
      </DialogActions>
    </Dialog>
  )
}