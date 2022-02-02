import { AccountBalance, Delete, Percent, Person, ShortText } from '@mui/icons-material';
import {
  Autocomplete,
  Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField
} from '@mui/material';
import { useCallback } from 'react';
import { useSelector } from '../../state/app';
import { Account, AccountId } from '../../state/slices/accounts';
import { isPersonId, useIsPersonId } from '../../state/slices/people';
import { useBoolean, useChangeEventState, useEventState, useKeyPress, useStopEvent } from '../../utils/hooks';
import { IconField } from '../mui';

const getAutocompleteId = (_: unknown, id: string) => id

interface Props {
  action: string,
  id?: AccountId,
  onClose: () => void,
  onDone: (details: Account) => void
}

export function CreateOrEditAccount({ id, onClose, onDone, action }: Props) {
  const account = useSelector(state => id ? state.accounts[id] : null, [id])
  const peopleIds = useSelector(state => state.peopleIds)
  const people = useSelector(state => state.people)
  const removeAccount = useSelector(state => state.removeAccount)

  const [name, onNameChange] = useChangeEventState(account?.name ?? '')
  const [owner, onOwnerChange] = useEventState(account?.owner ?? '', getAutocompleteId)
  const [growth, onGrowthChange] = useChangeEventState(`${account?.growth ?? 0}`)
  const [isOwnerOpen, setOwnerOpen, setOwnerClosed] = useBoolean(false)

  const isValidName = name !== ''
  const isValidOwner = useIsPersonId(owner)
  const isValidGrowth = !Number.isNaN(parseFloat(growth))
  const isValid = isValidName && isValidOwner && isValidGrowth

  const getOwnerName = useCallback(
    (id: string) => isPersonId(id, people) ? people[id].name : '',
    [people]
  )

  const saveAccount = useCallback(() => {
    if (isValid) {
      onDone({ name, owner, growth: parseFloat(growth) })
      onClose()
    }
  }, [onDone, name, owner, growth, onClose, isValid])

  const onDoneClick = useStopEvent(saveAccount)
  const onEnterKey = useKeyPress('Enter', onDoneClick)
  const onDeleteClick = useStopEvent(
    useCallback(() => {
      if (id) {
        removeAccount(id)
        onClose()
      }
    }, [id, onClose, removeAccount])
  )

  return (
    <>
      <Dialog fullWidth maxWidth='xs' open onClose={onClose}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}><AccountBalance sx={{ mr: 2 }} /> {action} account</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <IconField icon={<ShortText />} sx={{ mt: 1, mb: 2 }}>
            <TextField
              fullWidth
              label='Name'
              onChange={onNameChange}
              onKeyDown={onEnterKey}
              required
              size='small'
              value={name}
            />
          </IconField>
          <IconField icon={<Person />} sx={{ mb: 2 }}>
            <Autocomplete
              autoHighlight
              disableClearable
              fullWidth
              getOptionLabel={getOwnerName}
              onChange={onOwnerChange}
              onClose={setOwnerClosed}
              onOpen={setOwnerOpen}
              openOnFocus
              options={peopleIds}
              renderInput={(params) =>
                <TextField
                  {...params}
                  label='Owner'
                  onKeyDown={isOwnerOpen ? undefined : onEnterKey}
                  required
                  size='small'
                />
              }
              value={owner}
            />
          </IconField>
          <IconField icon={<Percent />}>
            <TextField
              error={!isValidGrowth}
              fullWidth
              label='Growth rate'
              onChange={onGrowthChange}
              onKeyDown={onEnterKey}
              required
              size='small'
              type='number'
              value={growth}
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