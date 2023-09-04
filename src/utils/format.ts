const formatter = new Intl.NumberFormat()
export const formatNumber = (value: number) => formatter.format(Math.floor(value))