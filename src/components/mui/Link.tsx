import { Link as MaterialLink, LinkProps } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function Link(props: LinkProps<typeof RouterLink>) {
  return <MaterialLink component={RouterLink} {...props} />
}