import { AccountBalance, Person } from '@mui/icons-material';
import { Paper, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { useCallback, useState } from 'react';
import { AccountId } from '../state/slices/accounts';
import { PersonId } from '../state/slices/people';
import { useIsDesktop } from '../utils/breakpoints';
import { useBoolean, useIf } from '../utils/hooks';
import { Accounts } from './accounts/Accounts';
import { CreateAccountDialog } from './accounts/CreateAccountDialog';
import { EditAccountDialog } from './accounts/EditAccountDialog';
import { CreatePersonDialog } from './people/CreatePersonDialog';
import { EditPersonDialog } from './people/EditPersonDialog';
import { People } from './people/People';

enum Action {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  NONE = 'NONE'
}

enum Entity {
  ACCOUNT = 'ACCOUNT',
  PERSON = 'PERSON'
}

interface CreatePerson {
  action: Action.CREATE,
  entity: Entity.PERSON
}

interface CreateAccount {
  action: Action.CREATE
  entity: Entity.ACCOUNT
}

interface EditPerson {
  action: Action.EDIT
  entity: Entity.PERSON
  id: PersonId
}

interface EditAccount {
  action: Action.EDIT
  entity: Entity.ACCOUNT
  id: AccountId
}

interface None {
  action: Action.NONE
}

const NO_MODE = { action: Action.NONE } as const

type Mode = CreatePerson | CreateAccount | EditPerson | EditAccount | None

const isToggle = (_: unknown, reason: string) => reason === 'toggle'
const isToggleOrBlur = (_: unknown, reason: string) => reason === 'toggle' || reason === 'blur' || reason === 'mouseLeave'

export function Settings() {
  const isDesktop = useIsDesktop()
  const [mode, setMode] = useState<Mode>(NO_MODE)
  const [isSpeedDialOpen, openSpeedDial, closeSpeedDial] = useBoolean(false)
  const openSpeedDialOnClick = useIf(isToggle, openSpeedDial)
  const closeSpeedDialOnClick = useIf(isToggleOrBlur, closeSpeedDial)

  const cancel = useCallback(() => setMode(NO_MODE), [])
  const createPerson = useCallback(() => setMode({ action: Action.CREATE, entity: Entity.PERSON }), [])
  const createAccount = useCallback(() => setMode({ action: Action.CREATE, entity: Entity.ACCOUNT }), [])
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
      <SpeedDial
        ariaLabel='account-actions'
        icon={<SpeedDialIcon />}
        onOpen={openSpeedDialOnClick}
        onClose={closeSpeedDialOnClick}
        open={isSpeedDialOpen}
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
      >
        <SpeedDialAction
          icon={<AccountBalance />}
          onClick={createAccount}
          tooltipOpen={!isDesktop}
          tooltipTitle='Account'
        />
        <SpeedDialAction
          icon={<Person />}
          onClick={createPerson}
          tooltipOpen={!isDesktop}
          tooltipTitle='Person'
        />
      </SpeedDial>
      {mode.action === Action.EDIT && mode.entity === Entity.PERSON && <EditPersonDialog id={mode.id} onClose={cancel} />}
      {mode.action === Action.EDIT && mode.entity === Entity.ACCOUNT && <EditAccountDialog id={mode.id} onClose={cancel} />}
      {mode.action === Action.CREATE && mode.entity === Entity.PERSON && <CreatePersonDialog onClose={cancel} />}
      {mode.action === Action.CREATE && mode.entity === Entity.ACCOUNT && <CreateAccountDialog onClose={cancel} />}
    </>
  )
}