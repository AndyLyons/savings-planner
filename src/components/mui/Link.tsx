import { Link as RouterLink } from 'react-router-dom'
import { Link as MaterialLink, LinkProps } from '@mui/material'

interface Props extends LinkProps {
  to: string
}

export function Link(props: Props) {
  return <MaterialLink component={RouterLink} {...props} />
}