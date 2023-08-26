import { SpeedDial as MaterialSpeedDial, SpeedDialIcon } from '@mui/material'
import { Children, cloneElement, ComponentProps, isValidElement } from 'react'
import { useIsDesktop } from '../../utils/breakpoints'
import { useBind, useBoolean, useIf } from '../../utils/hooks'

const isNotClickOnDesktop = (isDesktop: boolean, _: unknown, reason: string) => !isDesktop || reason !== 'toggle'

type Props = Omit<ComponentProps<typeof MaterialSpeedDial>, 'onOpen' | 'onClose' | 'open'>

export function SpeedDial({ children, sx, ...otherProps }: Props) {
  const isDesktop = useIsDesktop()
  const [isSpeedDialOpen, openSpeedDial, closeSpeedDial] = useBoolean(false)

  const canClose = useBind(isNotClickOnDesktop, isDesktop)
  const closeSpeedDialExceptClick = useIf(canClose, closeSpeedDial)

  const childrenWithTooltip = Children.map(
    children,
    child =>
      isValidElement(child)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? cloneElement(child, { tooltipOpen: !isDesktop } as any)
        : child
  )

  return (
    <MaterialSpeedDial
      icon={<SpeedDialIcon />}
      onOpen={openSpeedDial}
      onClose={closeSpeedDialExceptClick}
      open={isSpeedDialOpen}
      sx={{ position: 'fixed', bottom: 16, right: 16, ...sx }}
      {...otherProps}
    >
      {childrenWithTooltip}
    </MaterialSpeedDial>
  )
}