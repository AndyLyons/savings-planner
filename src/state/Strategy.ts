import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import { extract } from '../utils/fn';
import { Deposit } from './Deposit';
import type { DepositId } from './Deposit';
import type { Store } from './Store';

export type StrategyId = string & { __strategyId__: never }

export type StrategyJSON = typeof Strategy.prototype.json

export type StrategyDetails = {
  id: StrategyId
  name: string
  deposits?: Array<Deposit>
}

export class Strategy {
  store: Store

  id: StrategyId
  name: string
  deposits: Array<Deposit>

  constructor(store: Store, { id, name, deposits = [] }: StrategyDetails) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.name = name
    this.deposits = deposits
  }

  static create(store: Store, details: Omit<StrategyDetails, 'id'>) {
    return new Strategy(store, {
      ...details,
      id: nanoid(10) as StrategyId
    })
  }

  static fromJSON(store: Store, { deposits: depositsJson, ...details }: StrategyJSON) {
    const strategy = new Strategy(store, { deposits: [], ...details })
    const deposits = depositsJson.map(depositJson => Deposit.fromJSON(store, strategy, depositJson))
    deposits.forEach(deposit => strategy.addDeposit(deposit))
    return strategy
  }

  addDeposit(deposit: Deposit) {
    this.deposits.push(deposit)
  }

  removeDeposit(deposit: Deposit): void
  removeDeposit(id: DepositId): void
  removeDeposit(depositOrId: Deposit | DepositId) {
    const id = depositOrId instanceof Deposit ? depositOrId.id : depositOrId
    const depositIndex = this.deposits.findIndex(deposit => deposit.id === id)
    this.deposits.splice(depositIndex, 1)
  }

  get json() {
    return {
      ...extract(this, 'id', 'name'),
      deposits: this.deposits.map(deposit => deposit.toJSON())
    }
  }

  toJSON() {
    return this.json
  }
}
