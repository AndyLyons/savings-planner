import { Box, List, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Strategy } from '../../state/Strategy'
import { useIsDesktop } from '../../utils/breakpoints'
import { useStore } from '../../utils/mobx'
import { StrategyListItem } from './StrategyListItem'

interface Props {
  onClick: (strategy: Strategy) => void
}

export const Strategies = observer(function Strategies({ onClick }: Props) {
  const isDesktop = useIsDesktop()
  const strategies = useStore(store => store.strategies.values)

  return (
    <Box>
      <Typography variant='h6' component='h2'>Strategies</Typography>
      {strategies.length === 0 && <Typography sx={{ ml: 1, mt: 1 }}>No strategies yet</Typography>}
      <List dense={isDesktop}>
        {strategies.map(strategy => (
          <StrategyListItem key={strategy.id} strategy={strategy} onClick={onClick} />
        ))}
      </List>
    </Box>
  )
})