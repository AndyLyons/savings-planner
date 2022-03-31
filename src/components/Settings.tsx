import { AccountBalance, Person } from '@mui/icons-material';
import { Paper, SpeedDialAction } from '@mui/material';
import { useCallback, useState } from 'react';
import { AccountId } from '../state/slices/accounts';
import { PersonId } from '../state/slices/people';
import { useBind } from '../utils/hooks';
import { CreateAccount, EditAccount } from './accounts/AccountDialog';
import { Accounts } from './accounts/Accounts';
import { SpeedDial } from './mui/SpeedDial';
import { People } from './people/People';
import { CreatePerson, EditPerson } from './people/PersonDialog';

enum Action {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  NONE = 'NONE'
}

enum Entity {
  ACCOUNT = 'ACCOUNT',
  PERSON = 'PERSON'
}

interface ModeCreatePerson {
  action: Action.CREATE,
  entity: Entity.PERSON
}

interface ModeCreateAccount {
  action: Action.CREATE
  entity: Entity.ACCOUNT
}

interface ModeEditPerson {
  action: Action.EDIT
  entity: Entity.PERSON
  id: PersonId
}

interface ModeEditAccount {
  action: Action.EDIT
  entity: Entity.ACCOUNT
  id: AccountId
}

interface None {
  action: Action.NONE
}

const NO_MODE = { action: Action.NONE } as const
const CREATE_PERSON = { action: Action.CREATE, entity: Entity.PERSON } as const
const CREATE_ACCOUNT = { action: Action.CREATE, entity: Entity.ACCOUNT } as const

type Mode = ModeCreatePerson | ModeCreateAccount | ModeEditPerson | ModeEditAccount | None

export function Settings() {
  const [mode, setMode] = useState<Mode>(NO_MODE)

  const cancel = useBind(setMode, NO_MODE)
  const createPerson = useBind(setMode, CREATE_PERSON)
  const createAccount = useBind(setMode, CREATE_ACCOUNT)
  const editPerson = useCallback((id: PersonId) => setMode({ action: Action.EDIT, entity: Entity.PERSON, id }), [])
  const editAccount = useCallback((id: AccountId) => setMode({ action: Action.EDIT, entity: Entity.ACCOUNT, id }), [])

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <People onClick={editPerson} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Accounts onClick={editAccount} />
      </Paper>
      <SpeedDial ariaLabel='settings-actions'>
        <SpeedDialAction
          icon={<AccountBalance />}
          onClick={createAccount}
          tooltipTitle='Account'
        />
        <SpeedDialAction
          icon={<Person />}
          onClick={createPerson}
          tooltipTitle='Person'
        />
      </SpeedDial>
      {mode.action === Action.EDIT && mode.entity === Entity.PERSON && <EditPerson id={mode.id} onClose={cancel} />}
      {mode.action === Action.EDIT && mode.entity === Entity.ACCOUNT && <EditAccount id={mode.id} onClose={cancel} />}
      {mode.action === Action.CREATE && mode.entity === Entity.PERSON && <CreatePerson onClose={cancel} />}
      {mode.action === Action.CREATE && mode.entity === Entity.ACCOUNT && <CreateAccount onClose={cancel} />}
    </>
  )
}