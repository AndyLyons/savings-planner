import { CurrencyExchange } from '@mui/icons-material';
import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';
import { Optional } from '../utils/object';
import { configureCollection } from './Collection';
import { Deposit, DepositId } from './Deposit';
import type { Store } from './Store';
import { Withdrawal, WithdrawalId } from './Withdrawal';

export type StrategyId = string & { __strategyId__: never }

export type StrategySnapshotOut = typeof Strategy.prototype.snapshot
export type StrategySnapshotIn = Optional<StrategySnapshotOut, 'id'>

export const StrategyIcon = CurrencyExchange

const DepositCollection = configureCollection<Deposit, DepositId>({
  getId: deposit => deposit.id,
  create: Deposit.create
})

const WithdrawalCollection = configureCollection<Withdrawal, WithdrawalId>({
  getId: withdrawal => withdrawal.id,
  create: Withdrawal.create
})

export class Strategy {
  store: Store

  deposits: InstanceType<typeof DepositCollection>
  withdrawals: InstanceType<typeof WithdrawalCollection>

  id: StrategyId
  name: string

  constructor(
    store: Store,
    { id = Strategy.createId(), name, deposits, withdrawals }: StrategySnapshotIn
  ) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store

    this.id = id
    this.name = name

    this.deposits = new DepositCollection(store, deposits)
    this.withdrawals = new WithdrawalCollection(store, withdrawals)
  }

  static createId() {
    return nanoid(10) as StrategyId
  }

  static create(store: Store, snapshot: StrategySnapshotIn) {
    return new Strategy(store, snapshot)
  }

  get snapshot() {
    return {
      id: this.id,
      name: this.name,
      deposits: this.deposits.snapshot,
      withdrawals: this.withdrawals.snapshot
    }
  }

  restore({ name, deposits, withdrawals }: StrategySnapshotIn) {
    this.name = name
    this.deposits.restore(deposits)
    this.withdrawals.restore(withdrawals)
  }
}
