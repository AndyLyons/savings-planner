import { makeAutoObservable } from 'mobx'
import type { BalanceDetails, BalanceId } from './Balance'
import { Balance } from './Balance'
import type { Store } from './Store'

export type BalancesJSON = typeof Balances.prototype.json

export class Balances {
  store: Store

  data: Record<BalanceId, Balance> = {}

  constructor(store: Store) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
  }

  get values() {
    return Object.values(this.data)
  }

  get earliestBalance() {
    return this.values.length > 0
      ? this.values.map(({ date }) => date)
        .reduce((earliest, current) =>
          Number.parseInt(current) < Number.parseInt(earliest)
            ? current
            : earliest)
      : null
  }

  addBalance(details: Omit<BalanceDetails, 'id'>) {
    const balance = Balance.create(this.store, details)
    this.data[balance.id] = balance
  }

  getBalance(balanceId: BalanceId): Balance {
    return this.data[balanceId]
  }

  isBalanceId(balanceId: string | undefined): balanceId is BalanceId {
    return balanceId !== undefined && balanceId in this.data
  }

  removeBalance(balance: Balance): void
  removeBalance(balanceId: BalanceId): void
  removeBalance(balanceOrId: Balance | BalanceId) {
    const id = typeof balanceOrId === 'string' ? balanceOrId : balanceOrId.id
    delete this.data[id]
  }

  restoreSnapshot(snapshot: BalancesJSON) {
    snapshot
      .map(balance => Balance.fromJSON(this.store, balance))
      .forEach(this.addBalance)
  }

  get json() {
    return this.values.map(balance => balance.toJSON())
  }

  toJSON() {
    return this.json
  }
}