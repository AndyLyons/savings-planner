import { ListItemButton, ListItemButtonProps } from '@mui/material';
import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

export function ListItemButtonLink(props: ListItemButtonProps<typeof RouterLink>) {
  const { to, ...otherProps } = props

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
    <ListItemButton component={renderLink} {...otherProps} />
  )
}