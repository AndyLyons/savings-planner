import { Box, Paper, SpeedDialAction } from '@mui/material';
import { AccountIcon } from '../state/Account';
import { PersonIcon } from '../state/Person';
import { StrategyIcon } from '../state/Strategy';
import { useStore } from '../utils/mobx';
import { Accounts } from './accounts/Accounts';
import { Export } from './import/Export';
import { Import } from './import/Import';
import { SpeedDial } from './mui/SpeedDial';
import { People } from './people/People';
import { Strategies } from './strategies/Strategies';

export function Settings() {
  const store = useStore()

  return (
    <Box sx={{ minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Export sx={{ flexGrow: 1, mr: 1 }} />
        <Import sx={{ flexGrow: 1, ml: 1 }} />
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <People onClick={store.dialogs.editPerson} />
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Accounts onClick={store.dialogs.editAccount} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Strategies onClick={store.dialogs.editStrategy} />
      </Paper>
      <SpeedDial ariaLabel='settings-actions'>
        <SpeedDialAction
          icon={<StrategyIcon />}
          onClick={() => store.dialogs.createStrategy()}
          tooltipTitle='Strategy'
        />
        <SpeedDialAction
          icon={<AccountIcon />}
          onClick={() => store.dialogs.createAccount()}
          tooltipTitle='Account'
        />
        <SpeedDialAction
          icon={<PersonIcon />}
          onClick={() => store.dialogs.createPerson()}
          tooltipTitle='Person'
        />
      </SpeedDial>
    </Box>
  )
}