import { AccountBalance, Person as PersonIcon } from '@mui/icons-material';
import { Box, Paper, SpeedDialAction } from '@mui/material';
import { useUI } from '../utils/mobx';
import { Accounts } from './accounts/Accounts';
import { Export } from './import/Export';
import { Import } from './import/Import';
import { SpeedDial } from './mui/SpeedDial';
import { People } from './people/People';

export function Settings() {
  const ui = useUI()

  return (
    <Box sx={{ minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Export sx={{ flexGrow: 1, mr: 1 }} />
        <Import sx={{ flexGrow: 1, ml: 1 }} />
      </Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <People onClick={ui.editPerson} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Accounts onClick={ui.editAccount} />
      </Paper>
      <SpeedDial ariaLabel='settings-actions'>
        <SpeedDialAction
          icon={<AccountBalance />}
          onClick={ui.createAccount}
          tooltipTitle='Account'
        />
        <SpeedDialAction
          icon={<PersonIcon />}
          onClick={ui.createPerson}
          tooltipTitle='Person'
        />
      </SpeedDial>
    </Box>
  )
}