import { Breakpoint, Theme, useMediaQuery } from '@mui/material';

export function useEqual(breakpoint: Breakpoint) {
  return useMediaQuery<Theme>(theme => theme.breakpoints.only(breakpoint))
}

export function useMin(breakpoint: Breakpoint) {
  return useMediaQuery<Theme>(theme => theme.breakpoints.up(breakpoint))
}

export function useMax(breakpoint: Breakpoint) {
  const isUnder = useMediaQuery<Theme>(theme => theme.breakpoints.down(breakpoint))
  const isEqual = useEqual(breakpoint)
  return isUnder || isEqual
}

export function useNot(breakpoint: Breakpoint) {
  return useMediaQuery<Theme>(theme => theme.breakpoints.not(breakpoint))
}

export function useBetween(from: Breakpoint, to: Breakpoint) {
  const isBetween = useMediaQuery<Theme>(theme => theme.breakpoints.between(from, to))
  const isEqual = useEqual(to)
  return isBetween || isEqual
}