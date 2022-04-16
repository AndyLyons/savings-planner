export enum Direction {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  NONE = 'NONE'
}

export const COLOUR = {
  NONE: {},
  RED: { color: 'red' },
  GREEN: { color: 'green' },
  GRAY: { color: 'gray' }
}

export const getDirection = (balance: number, interpolated: number | undefined) => {
  if (interpolated === undefined) {
    return Direction.NONE
  }

  return balance >= interpolated ? Direction.INCREASE : Direction.DECREASE
}

export const getCellTextColour = (direction: Direction) => {
  if (direction === Direction.NONE) {
    return COLOUR.NONE
  }

  return Direction.INCREASE ? COLOUR.GREEN : COLOUR.RED
}

export const getButtonColour = (direction: Direction) => {
  if (direction === Direction.NONE) {
    return 'primary'
  }

  return direction === Direction.INCREASE ? 'success' : 'error'
}