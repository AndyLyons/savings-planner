/**
 * Global UI state - unpersisted
 */

import { makeAutoObservable } from 'mobx'
import type { Account, AccountJSON } from './Account'
import type { Balance, BalanceJSON } from './Balance'
import type { Deposit, DepositJSON } from './Deposit'
import type { Person, PersonJSON } from './Person'
import { Store } from './Store'
import type { Strategy, StrategyJSON } from './Strategy'
import type { Withdrawal, WithdrawalJSON } from './Withdrawal'

export enum DialogType {
  ACCOUNT = 'ACCOUNT',
  BALANCE = 'BALANCE',
  PERSON = 'PERSON',
  STRATEGY = 'STRATEGY',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL'
}

interface GenericDialog<D extends DialogType, T> {
  type: D
  initialValues: Partial<T>
  onDone: (details: T) => void
  onDelete?: () => void
}

type PersonDialog = GenericDialog<DialogType.PERSON, PersonJSON>
type AccountDialog = GenericDialog<DialogType.ACCOUNT, AccountJSON>
type BalanceDialog = GenericDialog<DialogType.BALANCE, BalanceJSON>
type StrategyDialog = GenericDialog<DialogType.STRATEGY, StrategyJSON>
type DepositDialog = GenericDialog<DialogType.DEPOSIT, DepositJSON>
type WithdrawalDialog = GenericDialog<DialogType.WITHDRAWAL, WithdrawalJSON>

type Dialog = PersonDialog | AccountDialog | BalanceDialog | StrategyDialog | DepositDialog | WithdrawalDialog

export class Dialogs {
  store: Store

  stack: Array<Dialog> = []

  constructor(store: Store) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
  }

  close() {
    this.stack.pop()
  }

  open(dialog: Dialog) {
    this.stack.push(dialog)
  }

  createPerson(initialValues: PersonDialog['initialValues'] = {}) {
    this.open({
      type: DialogType.PERSON,
      initialValues,
      onDone: this.store.people.create
    })
  }

  createAccount(initialValues: AccountDialog['initialValues'] = {}) {
    this.open({
      type: DialogType.ACCOUNT,
      initialValues,
      onDone: this.store.accounts.create
    } as Dialog)
  }

  createBalance(account: Account, initialValues: BalanceDialog['initialValues'] = {}) {
    this.open({
      type: DialogType.BALANCE,
      initialValues,
      onDone: account.balances.create
    })
  }

  createStrategy(initialValues: StrategyDialog['initialValues'] = {}) {
    this.open({
      type: DialogType.STRATEGY,
      initialValues,
      onDone: this.store.strategies.create
    })
  }

  createDeposit(strategy: Strategy, initialValues: DepositDialog['initialValues'] = {}) {
    this.open({
      type: DialogType.DEPOSIT,
      initialValues,
      onDone: strategy.deposits.create
    })
  }

  createWithdrawal(strategy: Strategy, initialValues: WithdrawalDialog['initialValues'] = {}) {
    this.open({
      type: DialogType.WITHDRAWAL,
      initialValues,
      onDone: strategy.withdrawals.create
    })
  }

  editPerson(person: Person) {
    this.open({
      type: DialogType.PERSON,
      initialValues: person.toJSON(),
      onDone: person.restore,
      onDelete: () => this.store.people.remove(person)
    })
  }

  editAccount(account: Account) {
    this.open({
      type: DialogType.ACCOUNT,
      initialValues: account.toJSON(),
      onDone: account.restore,
      onDelete: () => this.store.accounts.remove(account)
    })
  }

  editBalance(balance: Balance) {
    this.open({
      type: DialogType.BALANCE,
      initialValues: balance.toJSON(),
      onDone: balance.restore,
      onDelete: () => balance.account.balances.remove(balance)
    })
  }

  editStrategy(strategy: Strategy) {
    this.open({
      type: DialogType.STRATEGY,
      initialValues: strategy.toJSON(),
      onDone: strategy.restore,
      onDelete: () => this.store.strategies.remove(strategy)
    })
  }

  editDeposit(deposit: Deposit) {
    this.open({
      type: DialogType.DEPOSIT,
      initialValues: deposit.toJSON(),
      onDone: deposit.restore,
      onDelete: () => deposit.strategy.deposits.remove(deposit)
    })
  }

  editWithdrawal(withdrawal: Withdrawal) {
    this.open({
      type: DialogType.WITHDRAWAL,
      initialValues: withdrawal.toJSON(),
      onDone: withdrawal.restore,
      onDelete: () => withdrawal.strategy.withdrawals.remove(withdrawal)
    })
  }
}