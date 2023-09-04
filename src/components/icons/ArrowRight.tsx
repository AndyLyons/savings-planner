import { SvgIcon } from '@mui/material'
import { ComponentProps } from 'react'

export function ArrowRight(props: ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props}>
      <path d="M 21 12 l -3.99 -4 v 3 H 10 v 2 h 7.01 v 3 L 21 12 z" />
    </SvgIcon>
  )
}
