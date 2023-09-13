import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import { Account } from "../../../../state/Account"
import { YYYYMM, fromYYYYMM, getYear, subMonth } from "../../../../utils/date"
import { formatNumber } from "../../../../utils/format"
import { useStore } from "../../../../utils/mobx"

export const AccountBreakdown = observer(function AccountBreakdown({ account, date }: { account: Account, date: YYYYMM }) {
  const { isDateInExpandedYear } = useStore()
  const isExpanded = isDateInExpandedYear(date)
  const previous = account.getBalance(subMonth(date, isExpanded ? 1 : 12))
  const interest = isExpanded ? account.getInterestTotal(date) : account.getYearInterestTotal(getYear(date))
  const deposits = isExpanded ? account.getDepositsTotal(date) : account.getYearDepositsTotal(getYear(date))
  const withdrawals = isExpanded ? account.getWithdrawalsTotal(date) : account.getYearWithdrawalsTotal(getYear(date))
  const calculatedBalance = account.getCalculatedBalance(date)

  return (
    <ul className='account-breakdown'>
      <li className='account-breakdown--date'>{format(fromYYYYMM(date), isExpanded ? 'MMM yyyy' : 'yyyy')}</li>
      <li className='account-breakdown--existing'>£{formatNumber(previous)}</li>
      <li className='account-breakdown--add'>£{formatNumber(deposits)} deposits</li>
      <li className='account-breakdown--add'>£{formatNumber(interest)} interest</li>
      <li className='account-breakdown--subtract'>£{formatNumber(withdrawals)} w/d</li>
      <li className='account-breakdown--total'>£{formatNumber(calculatedBalance)}</li>
    </ul>
  )
})