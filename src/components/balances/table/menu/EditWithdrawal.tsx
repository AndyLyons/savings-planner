import { AltRoute, StopCircleOutlined, Visibility, VisibilityOff } from "@mui/icons-material"
import { IconButton, ListItem, ListItemButton } from "@mui/material"
import { observer } from "mobx-react-lite"
import { Withdrawal } from "../../../../state/Withdrawal"
import { YYYY, subYear } from "../../../../utils/date"
import { useAction } from "../../../../utils/mobx"

export const EditWithdrawal = observer(function EditWithdrawal({ year, withdrawal }: { year: YYYY, withdrawal: Withdrawal }) {
  const editWithdrawal = useAction(store => store.dialogs.editWithdrawal(withdrawal), [withdrawal])

  const splitWithdrawal = useAction(store => {
    const { strategy } = store
    if (strategy) {
      const { id: _, ...withdrawalSnapshot } = withdrawal.snapshot
      const startDate = year
      store.dialogs.createWithdrawal(
        strategy,
        {
          ...withdrawalSnapshot,
          startDate
        },
        () => {
          withdrawal.endDate = subYear(startDate)
        }
      )
    }
  }, [withdrawal])

  const stopWithdrawal = useAction(() => {
    withdrawal.endDate = year
  }, [])

  const isStartDate = year === withdrawal.startDateValue
  const isSingleYear = !withdrawal.repeating || withdrawal.startDateValue === withdrawal.endDateValue

  return (
    <ListItem dense disablePadding secondaryAction={
      <>
        <IconButton edge="end" onClick={withdrawal.toggleHidden} size='small'>
          {withdrawal.hidden ? <VisibilityOff fontSize='inherit' /> : <Visibility fontSize='inherit' />}
        </IconButton>
        <IconButton disabled={isSingleYear} edge="end" onClick={stopWithdrawal} size='small'>
          <StopCircleOutlined fontSize='inherit' />
        </IconButton>
        <IconButton disabled={isStartDate} edge="end" onClick={splitWithdrawal} size='small'>
          <AltRoute fontSize='inherit' />
        </IconButton>
      </>
    }>
      <ListItemButton
        onClick={editWithdrawal}
        sx={{ textDecoration: withdrawal.hidden ? 'line-through' : '', paddingRight: '95px !important' }}
      >
        {withdrawal.description}
      </ListItemButton>
    </ListItem>
  )
})