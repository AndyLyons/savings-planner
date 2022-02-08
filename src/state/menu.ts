import { useCallback } from 'react'
import create from 'zustand'
import { immer } from './middleware'

type MenuState = {
    isOpen: boolean

    toggleMenu: (value?: boolean) => void
}

const useMenu = create<MenuState>(
  immer((set) => ({
    isOpen: false,

    toggleMenu(value) {
      set(state => {
        if (value === undefined) {
          state.isOpen = !state.isOpen
        } else {
          state.isOpen = value
        }
      })
    },
  }))
)

const getIsOpen = (state: MenuState) => state.isOpen
const getToggleMenu = (state: MenuState) => state.toggleMenu

export function useMenuOpen() {
  return useMenu(getIsOpen)
}

export function useToggleMenu(value?: boolean) {
  const toggleMenu = useMenu(getToggleMenu)
  return useCallback(() => toggleMenu(value), [toggleMenu, value])
}
