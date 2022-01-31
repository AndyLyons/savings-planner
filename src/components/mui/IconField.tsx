import { Box } from '@mui/material'
import { cloneElement, ComponentProps, PropsWithChildren, ReactElement } from 'react'

type Props = PropsWithChildren<{
  icon: ReactElement
  sx?: ComponentProps<typeof Box>['sx']
}>

export function IconField({ children, icon, sx }: Props) {
  const iconWithMargin = cloneElement(icon, { sx: { mr: 1, ...icon.props.sx } })

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      {iconWithMargin}
      {children}
    </Box>
  )
}