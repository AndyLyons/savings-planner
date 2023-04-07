import { ContentCopy, CurrencyExchange } from '@mui/icons-material'
import {
  IconButton,
  ListItem,
  ListItemButton, ListItemIcon, ListItemText, Typography
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Strategy } from '../../state/Strategy'
import { useBind } from '../../utils/hooks'
import { useAction } from '../../utils/mobx'

interface Props {
    strategy: Strategy,
    onClick: (strategy: Strategy) => void
}

export const StrategyListItem = observer(function StrategyListItem({ strategy, onClick }: Props) {
  const onClickStrategy = useBind(onClick, strategy)
  const copyStrategy = useAction((store) => {
    const { id, ...snapshot } = strategy.snapshot
    const copy = {
      ...snapshot,
      name: `${snapshot.name} (copy)`
    }
    store.strategies.create(copy)
  }, [])

  return (
    <ListItem secondaryAction={<IconButton edge='end' onClick={copyStrategy}><ContentCopy /></IconButton>}>
      <ListItemButton onClick={onClickStrategy} sx={{ pl: 4, justifyContent: 'flex-start' }}>
        <ListItemIcon>
          <CurrencyExchange />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              <Typography sx={{ fontWeight: 'bold' }} component='span'>{strategy.name}</Typography>
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  )
})