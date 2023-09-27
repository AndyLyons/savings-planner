import { Expand } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { format } from "date-fns";
import { observer } from "mobx-react-lite";
import { YYYYMM, fromYYYYMM, getYear } from "../../../../utils/date";
import { useStore } from "../../../../utils/mobx";
import { useBind } from "../../../../utils/hooks";

export const DateCell = observer(function DateCell({ date }: { date: YYYYMM }) {
  const { toggleExpandedYear } = useStore()
  const onClickExpand = useBind(toggleExpandedYear, getYear(date))

  return (
    <div className='table-cell table-column--date'>
      <IconButton
        className="table-column--date--expand-icon"
        onClick={onClickExpand}
        size="small"
        sx={{ marginLeft: '5px' }}
      >
        <Expand fontSize="inherit" />
      </IconButton>
      <span className='table-column--date_year'>{getYear(date)}</span>
      <span className='table-column--date_month'>{format(fromYYYYMM(date), 'MMM')}</span>
    </div>
  )
})