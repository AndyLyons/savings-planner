import React, { PropsWithChildren } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps, To } from 'react-router-dom';
import { ListItemButton } from '@mui/material';

type Props = PropsWithChildren<{
  selected?: boolean
  to: To
}>

export function ListItemButtonLink({ children, selected, to }: Props) {
  const renderLink = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(function Link(
        itemProps,
        ref,
      ) {
        return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
      }),
    [to],
  );

  return (
    <ListItemButton component={renderLink} selected={selected}>
      {children}
    </ListItemButton>
  )
}