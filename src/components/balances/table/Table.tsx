import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { forwardRef } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { ListItemKeySelector } from 'react-window'
import { VariableSizeList } from 'react-window'
import { YYYYMM } from '../../../utils/date'
import { useStore } from '../../../utils/mobx'
import { Header } from './Header'
import { Row } from './Row'

const TableBody = forwardRef<HTMLDivElement, React.PropsWithChildren<unknown>>(function TableBody({ children, ...rest }, ref) {
  return (
    <div ref={ref} {...rest}>
      <Header />
      {children}
    </div>
  )
})

const getItemSize = (index: number) => index === 0 ? 84 : 24
const getKey: ListItemKeySelector<Array<YYYYMM>> = (index, dates) => index === 0 ? '__HEADER__' : dates[index - 1]

const TableInner = observer(function TableInner({ height, width }: { height: number, width: number }) {
  const { dates, showAges, showPerspective } = useStore()

  return (
    <VariableSizeList
      className={classNames('table', {
        'hide-ages': !showAges,
        'table__show-perspective': showPerspective
      })}
      height={height}
      width={width}
      itemCount={dates.length + 1} // +1 for header row
      itemData={dates}
      innerElementType={TableBody}
      itemKey={getKey}
      itemSize={getItemSize}
    >
      {Row}
    </VariableSizeList>
  )
})

export function Table() {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <TableInner height={height} width={width} />
      )}
    </AutoSizer>
  )
}