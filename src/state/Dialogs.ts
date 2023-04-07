/**
 * Global UI state - unpersisted
 */

import { makeAutoObservable } from 'mobx'
import { ComponentProps } from 'react'
import { AccountDialog } from '../components/dialogs/AccountDialog'
import { BalanceDialog } from '../components/dialogs/BalanceDialog'
import { DepositDialog } from '../components/dialogs/DepositDialog'
import { PersonDialog } from '../components/dialogs/PersonDialog'
import { StrategyDialog } from '../components/dialogs/StrategyDialog'
import { WithdrawalDialog } from '../components/dialogs/WithdrawalDialog'
import type { Account } from './Account'
import type { Balance } from './Balance'
import type { Deposit } from './Deposit'
import type { Person } from './Person'
import { Store } from './Store'
import type { Strategy } from './Strategy'
import type { Withdrawal } from './Withdrawal'

export enum DialogType {
  ACCOUNT = 'ACCOUNT',
  BALANCE = 'BALANCE',
  PERSON = 'PERSON',
  STRATEGY = 'STRATEGY',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL'
}

type DialogComponent = React.ComponentType<{
  initialValues: any,
  onClose(): void
  onDelete?(): void
  onDone(details: any): void
}>

interface GenericDialog<D extends DialogType, T extends DialogComponent> {
  type: D
  initialValues: ComponentProps<T>['initialValues']
  onDone: ComponentProps<T>['onDone']
  onDelete?: ComponentProps<T>['onDelete']
}

type PersonDialogConfig = GenericDialog<DialogType.PERSON, typeof PersonDialog>
type AccountDialogConfig = GenericDialog<DialogType.ACCOUNT, typeof AccountDialog>
type BalanceDialogConfig = GenericDialog<DialogType.BALANCE, typeof BalanceDialog>
type StrategyDialogConfig = GenericDialog<DialogType.STRATEGY, typeof StrategyDialog>
type DepositDialogConfig = GenericDialog<DialogType.DEPOSIT, typeof DepositDialog>
type WithdrawalDialogConfig = GenericDialog<DialogType.WITHDRAWAL, typeof WithdrawalDialog>

type DialogConfig = PersonDialogConfig | AccountDialogConfig | BalanceDialogConfig | StrategyDialogConfig | DepositDialogConfig | WithdrawalDialogConfig

export class Dialogs {
  store: Store

  stack: Array<DialogConfig> = []

  constructor(store: Store) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
  }

  close() {
    this.stack.pop()
  }

  open(dialog: DialogConfig) {
    this.stack.push(dialog)
  }

  createPerson(initialValues: PersonDialogConfig['initialValues'] = {}) {
    this.open({
      type: DialogType.PERSON,
      initialValues,
      onDone: this.store.people.create
    })
  }

  createAccount(initialValues: AccountDialogConfig['initialValues'] = {}) {
    this.open({
      type: DialogType.ACCOUNT,
      initialValues,
      onDone: this.store.accounts.create
    })
  }

  createBalance(account: Account, initialValues: BalanceDialogConfig['initialValues']) {
    this.open({
      type: DialogType.BALANCE,
      initialValues,
      onDone: account.balances.create
    })
  }

  createStrategy(initialValues: StrategyDialogConfig['initialValues'] = {}) {
    this.open({
      type: DialogType.STRATEGY,
      initialValues,
      onDone: this.store.strategies.create
    })
  }

  createDeposit(strategy: Strategy, initialValues: DepositDialogConfig['initialValues'] = {}) {
    this.open({
      type: DialogType.DEPOSIT,
      initialValues,
      onDone: strategy.deposits.create
    })
  }

  createWithdrawal(strategy: Strategy, initialValues: WithdrawalDialogConfig['initialValues'] = {}) {
    this.open({
      type: DialogType.WITHDRAWAL,
      initialValues,
      onDone: strategy.withdrawals.create
    })
  }

  editPerson(person: Person) {
    this.open({
      type: DialogType.PERSON,
      initialValues: person.snapshot,
      onDone: person.restore,
      onDelete: () => this.store.people.remove(person)
    })
  }

  editAccount(account: Account) {
    this.open({
      type: DialogType.ACCOUNT,
      initialValues: account.snapshot,
      onDone: account.restore,
      onDelete: () => this.store.accounts.remove(account)
    })
  }

  editBalance(balance: Balance) {
    this.open({
      type: DialogType.BALANCE,
      initialValues: balance.snapshot,
      onDone: balance.restore,
      onDelete: () => balance.account.balances.remove(balance)
    })
  }

  editStrategy(strategy: Strategy) {
    this.open({
      type: DialogType.STRATEGY,
      initialValues: strategy.snapshot,
      onDone: strategy.restore,
      onDelete: () => this.store.strategies.remove(strategy)
    })
  }

  editDeposit(deposit: Deposit) {
    this.open({
      type: DialogType.DEPOSIT,
      initialValues: deposit.snapshot,
      onDone: deposit.restore,
      onDelete: () => deposit.strategy.deposits.remove(deposit)
    })
  }

  editWithdrawal(withdrawal: Withdrawal) {
    this.open({
      type: DialogType.WITHDRAWAL,
      initialValues: withdrawal.snapshot,
      onDone: withdrawal.restore,
      onDelete: () => withdrawal.parentStrategy.withdrawals.remove(withdrawal)
    })
  }
}