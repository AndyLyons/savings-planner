import { PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Typography } from '@mui/material';
import { Link } from '../mui';
import { useSelector } from '../../state/app';
import { AccountId, useIsAccountId } from '../../state/slices/accounts';

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

function ValidAccount({ id }: { id: AccountId }) {
  const accounts = useSelector(state => state.accounts)
  const people = useSelector(state => state.people)

  const account = accounts[id]
  const owner = people[account.owner]

  return (
    <Box>
      <Title>{account.name} ({owner.name})</Title>
      <Typography align='center' variant='body1' sx={{ mt: 4, mb: 4 }}></Typography>
    </Box>
  )
}

export function Account() {
  const { accountId } = useParams()
  const isValidAccount = useIsAccountId(accountId)

  return (
    isValidAccount
      ? <ValidAccount id={accountId} />
      : (
        <Box>
          <Title>Invalid account</Title>
          <Typography align='center' variant='body1' sx={{ mt: 4, mb: 4 }}>Sorry, this account could not be found :(</Typography>
        </Box>
      )
  )
}