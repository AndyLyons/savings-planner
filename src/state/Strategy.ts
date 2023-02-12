import { CurrencyExchange } from '@mui/icons-material';
import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import { Collection } from './Collection';
import { Deposit, DepositId } from './Deposit';
import type { Store } from './Store';
import { Withdrawal, WithdrawalId } from './Withdrawal';

export type StrategyId = string & { __strategyId__: never }

export type StrategyJSON = typeof Strategy.prototype.json

export const StrategyIcon = CurrencyExchange

export class Strategy {
  store: Store
  deposits: Collection<Deposit, DepositId> = new Collection({
    getId: deposit => deposit.id,
    fromJSON: (json, copy) => Deposit.fromJSON(this.store, this, json, copy)
  })
  withdrawals: Collection<Withdrawal, WithdrawalId> = new Collection({
    getId: withdrawal => withdrawal.id,
    fromJSON: (json, copy) => Withdrawal.fromJSON(this.store, this, json, copy)
  })

  id: StrategyId
  name: string

  constructor(
    store: Store,
    { id, name }:
      Pick<Strategy, 'id' | 'name'>
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.name = name
  }

  static createId() {
    return nanoid(10) as StrategyId
  }

  static fromJSON(store: Store, json: StrategyJSON, copy?: boolean) {
    const { id, deposits: depositsJson, withdrawals: withdrawalsJson, ...rest } = json

    const strategy = new Strategy(store, {
      id: copy ? Strategy.createId() : id,
      ...rest
    })
    strategy.deposits.restore(depositsJson, copy)
    strategy.withdrawals.restore(withdrawalsJson, copy)
    return strategy
  }

  restore({ name, deposits, withdrawals }: StrategyJSON, copy?: boolean) {
    this.name = name
    this.deposits.restore(deposits, copy)
    this.withdrawals.restore(withdrawals, copy)
  }

  get json() {
    return {
      id: this.id,
      name: this.name,
      deposits: this.deposits.toJSON(),
      withdrawals: this.withdrawals.toJSON()
    }
  }

  toJSON() {
    return this.json
  }
}
