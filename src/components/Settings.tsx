import { AccountBalance, Person as PersonIcon } from '@mui/icons-material';
import { Box, Paper, SpeedDialAction } from '@mui/material';
import { useCallback, useState } from 'react';
import type { Account } from '../state/Account';
import type { Person } from '../state/Person';
import { useBind } from '../utils/hooks';
import { CreateAccount, EditAccount } from './accounts/AccountDialog';
import { Accounts } from './accounts/Accounts';
import { Export } from './import/Export';
import { Import } from './import/Import';
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
  model: Person
}

interface ModeEditAccount {
  action: Action.EDIT
  entity: Entity.ACCOUNT
  model: Account
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
  const editPerson = useCallback((person: Person) => setMode({ action: Action.EDIT, entity: Entity.PERSON, model: person }), [])
  const editAccount = useCallback((account: Account) => setMode({ action: Action.EDIT, entity: Entity.ACCOUNT, model: account }), [])

  return (
    <Box sx={{ minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Export sx={{ flexGrow: 1, mr: 1 }} />
        <Import sx={{ flexGrow: 1, ml: 1 }} />
      </Box>
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
          icon={<PersonIcon />}
          onClick={createPerson}
          tooltipTitle='Person'
        />
      </SpeedDial>
      {mode.action === Action.EDIT && mode.entity === Entity.PERSON && <EditPerson person={mode.model} onClose={cancel} />}
      {mode.action === Action.EDIT && mode.entity === Entity.ACCOUNT && <EditAccount account={mode.model} onClose={cancel} />}
      {mode.action === Action.CREATE && mode.entity === Entity.PERSON && <CreatePerson onClose={cancel} />}
      {mode.action === Action.CREATE && mode.entity === Entity.ACCOUNT && <CreateAccount onClose={cancel} />}
    </Box>
  )
}