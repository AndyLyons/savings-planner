import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add } from '@mui/icons-material';
import { ListItemButtonLink } from '../mui/ListItemButtonLink';

export function FooterListItem() {
  return (
    <ListItem>
      <ListItemButtonLink to='add'>
        <ListItemIcon><Add /></ListItemIcon>
        <ListItemText>Add another person</ListItemText>
      </ListItemButtonLink>
    </ListItem>
  )
}