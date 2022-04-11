import { makeAutoObservable } from 'mobx'
import { keys } from '../utils/fn'
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
    return Object.values(this.data).sort(
      (balance1, balance2) => Number(balance1) - Number(balance2)
    )
  }

  addBalance(details: Omit<BalanceDetails, 'id'>) {
    const balance = Balance.create(this.store, details)
    this.data[balance.id] = balance
  }

  clear() {
    keys(this.data).forEach(key => {
      delete this.data[key]
    })
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
    this.clear()

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