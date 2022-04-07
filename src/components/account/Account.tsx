import { CurrencyPound } from '@mui/icons-material'
import { Box, Breadcrumbs, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { PropsWithChildren } from 'react'
import { useParams } from 'react-router-dom'
import { AccountId } from '../../state/Account'
import { useStore } from '../../utils/mobx'
import { Link } from '../mui'
import './index.css'

function Title({ children }: PropsWithChildren<{}>) {
  return (
    <Breadcrumbs>
      <Link to='/accounts' underline='hover'>
        <Typography variant='h6' component='h2'>Accounts</Typography>
      </Link>
      <Typography variant='h6' component='h2'>{children}</Typography>
    </Breadcrumbs>
  )
}

const ValidAccount = observer(function ValidAccount({ id }: { id: AccountId }) {
  const account = useStore(store => store.accounts.getAccount(id))

  return (
    <Box>
      <Title>{account.name} ({account.owner.name})</Title>
      <SpeedDial
        ariaLabel='account-actions'
        icon={<SpeedDialIcon />}
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
      >
        <SpeedDialAction
          classes={{ staticTooltipLabel: 'account-speedDial-tooltipLabel' }}
          icon={<CurrencyPound />}
          tooltipOpen
          tooltipTitle='Value'
        />
      </SpeedDial>
    </Box>
  )
})

export const Account = observer(function Account() {
  const { accountId } = useParams()
  const isAccountId = useStore(store => store.accounts.isAccountId)

  return (
    isAccountId(accountId)
      ? <ValidAccount id={accountId} />
      : (
        <Box>
          <Title>Invalid account</Title>
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography align='center' variant='body1'>Whoops, this account doesn't exist!</Typography>
            <Typography align='center' variant='body1'><Link to='/accounts' underline='hover'>Go back to the Accounts screen</Link> to select an account</Typography>
          </Box>
        </Box>
      )
  )
})