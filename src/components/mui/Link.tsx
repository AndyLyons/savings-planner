import { Link as RouterLink } from 'react-router-dom'
import { Link as MaterialLink, LinkProps } from '@mui/material'

export function Link(props: LinkProps<typeof RouterLink>) {
  return <MaterialLink component={RouterLink} {...props} />
}