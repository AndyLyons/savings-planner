import { AltRoute, StopCircleOutlined, Visibility, VisibilityOff } from "@mui/icons-material"
import { IconButton, ListItem, ListItemButton } from "@mui/material"
import { observer } from "mobx-react-lite"
import { Deposit } from "../../../../state/Deposit"
import { YYYY, subYear } from "../../../../utils/date"
import { useAction } from "../../../../utils/mobx"

export const EditDeposit = observer(function EditDeposit({ year, deposit }: { year: YYYY, deposit: Deposit }) {
  const editDeposit = useAction(store => store.dialogs.editDeposit(deposit), [deposit])

  const splitDeposit = useAction(store => {
    const { strategy } = store
    if (strategy) {
      const { id: _, ...depositSnapshot } = deposit.snapshot
      const startDate = year
      store.dialogs.createDeposit(
        strategy,
        {
          ...depositSnapshot,
          startDate
        },
        () => {
          deposit.endDate = subYear(startDate)
        }
      )
    }
  }, [deposit])

  const stopDeposit = useAction(() => {
    deposit.endDate = year
  }, [])

  const isStartDate = year === deposit.startDateValue
  const isSingleYear = !deposit.repeating || deposit.startDateValue === deposit.endDateValue

  return (
    <ListItem dense disablePadding secondaryAction={
      <>
        <IconButton edge="end" onClick={deposit.toggleHidden} size='small'>
          {deposit.hidden ? <VisibilityOff fontSize='inherit' /> : <Visibility fontSize='inherit' />}
        </IconButton>
        <IconButton disabled={isSingleYear} edge="end" onClick={stopDeposit} size='small'>
          <StopCircleOutlined fontSize='inherit' />
        </IconButton>
        <IconButton disabled={isStartDate} edge="end" onClick={splitDeposit} size='small'>
          <AltRoute fontSize='inherit' />
        </IconButton>
      </>
    }>
      <ListItemButton
        onClick={editDeposit}
        sx={{ textDecoration: deposit.hidden ? 'line-through' : '', paddingRight: '95px !important' }}
      >
        {deposit.description}
      </ListItemButton>
    </ListItem>
  )
})