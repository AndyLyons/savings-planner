import { Box, IconButton } from "@mui/material"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { useAction, useStore } from "../../../utils/mobx"
import { Add, VisibilityOutlined } from "@mui/icons-material"

export const Header = observer(function Header() {
  const { dialogs, people, accounts, togglePerspective } = useStore()
  const numAccounts = accounts.keys.length

  const sxIncomes = useMemo(() => ({ width: '110px' }), [])
  const sxBalances = useMemo(() => ({ width: `${110 + (numAccounts * 110)}px` }), [numAccounts])

  const onAddAccountClicked = useAction(store => store.dialogs.createAccount(), [])

  return (
    <div className="table-header">
      <div className="table-row table-row--groups">
        <div className='table-cell--empty table-column--date'></div>
        {people.keys.map(personId => (
          <div key={personId} className='table-cell--empty table-column--age'></div>
        ))}
        <Box className='table-cell table-columns--incomes' sx={sxIncomes}>Income</Box>
        <Box className='table-cell table-columns--balances' sx={sxBalances}>Balance</Box>
      </div>
      <div className="table-row table-row--headers">
        <div className='table-cell table-column--date' onClick={togglePerspective}><VisibilityOutlined /> Date</div>
        {people.values.map(person => (
          <div key={person.id} className='table-cell table-column--age'>{person.name}</div>
        ))}
        <div className='table-cell table-column--total'>Total (£)</div>
        <div className='table-cell table-column--total'>Total (£)</div>
        {accounts.values.map(account => (
          <div
            key={account.id}
            className='table-cell table-column--account-balance'
            onClick={() => dialogs.editAccount(account)}
          >
            {account.description}
          </div>
        ))}
        <div className='table-column--add-account'>
          <IconButton title="Add account" onClick={onAddAccountClicked}>
            <Add />
          </IconButton>
        </div>
      </div>
    </div>
  )
})