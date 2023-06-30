import type { ReactElement } from 'react'
import { IconField } from "../mui";

export function FieldWrapper({ children, icon, isVisible }: React.PropsWithChildren<{
  icon: ReactElement,
  isVisible: boolean
}>) {
  return (
    <IconField
      icon={icon}
      sx={isVisible ? {} : { display: 'none' }}
    >
      {children}
    </IconField>
  )
}