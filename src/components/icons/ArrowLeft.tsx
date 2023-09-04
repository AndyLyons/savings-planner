import { SvgIcon } from '@mui/material'
import { ComponentProps } from 'react'

export function ArrowLeft(props: ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props}>
      <path d="M 6.99 8 L3 12 l 3.99 4 v -3 H 14 v -2 H 6.99 v -3 z" />
    </SvgIcon>
  )
}