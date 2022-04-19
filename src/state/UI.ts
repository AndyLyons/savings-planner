/**
 * Global UI state - unpersisted
 */

import { makeAutoObservable } from 'mobx'
import React from 'react'
import type { Account, AccountId, AccountJSON } from './Account'
import type { Balance, BalanceJSON } from './Balance'
import type { Person, PersonJSON } from './Person'
import type { Deposit, DepositJSON } from './Deposit'

export enum Action {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  NONE = 'NONE'
}

export enum Entity {
  ACCOUNT = 'ACCOUNT',
  BALANCE = 'BALANCE',
  PERSON = 'PERSON',
  DEPOSIT = 'DEPOSIT'
}

interface CreatePerson {
  action: Action.CREATE,
  entity: Entity.PERSON
  initialValues?: Partial<PersonJSON>
}

interface CreateBalance {
  action: Action.CREATE
  entity: Entity.BALANCE
  initialValues?: Partial<BalanceJSON & {
    account: AccountId
  }>
}

interface CreateAccount {
  action: Action.CREATE
  entity: Entity.ACCOUNT
  initialValues?: Partial<AccountJSON>
}

interface CreateDeposit {
  action: Action.CREATE
  entity: Entity.DEPOSIT
  initialValues?: Partial<DepositJSON>
}

interface EditPerson {
  action: Action.EDIT
  entity: Entity.PERSON
  model: Person
}

interface EditAccount {
  action: Action.EDIT
  entity: Entity.ACCOUNT
  model: Account
}

interface EditBalance {
  action: Action.EDIT
  entity: Entity.BALANCE
  model: Balance
}

interface EditDeposit {
  action: Action.EDIT
  entity: Entity.DEPOSIT
  model: Deposit
}

type Dialog = CreatePerson | CreateAccount | CreateBalance | CreateDeposit | EditPerson | EditAccount | EditBalance | EditDeposit

export class UI {
  dialogs: Array<Dialog> = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  cancel() {
    this.dialogs.pop()
  }

  createPerson() {
    this.createPersonFrom()
  }

  createPersonFrom(initialValues?: CreatePerson['initialValues']) {
    this.dialogs.push({ action: Action.CREATE, entity: Entity.PERSON, initialValues })
  }

  createAccount() {
    this.createAccountFrom()
  }

  createAccountFrom(initialValues?: CreateAccount['initialValues']) {
    this.dialogs.push({ action: Action.CREATE, entity: Entity.ACCOUNT, initialValues })
  }

  createBalance() {
    this.createBalanceFrom()
  }

  createBalanceFrom(initialValues?: CreateBalance['initialValues']) {
    this.dialogs.push({ action: Action.CREATE, entity: Entity.BALANCE, initialValues })
  }

  createDeposit() {
    this.createDepositFrom()
  }

  createDepositFrom(initialValues?: CreateDeposit['initialValues']) {
    this.dialogs.push({ action: Action.CREATE, entity: Entity.DEPOSIT, initialValues })
  }

  editPerson(person: Person) {
    this.dialogs.push({ action: Action.EDIT, entity: Entity.PERSON, model: person })
  }

  editAccount(account: Account) {
    this.dialogs.push({ action: Action.EDIT, entity: Entity.ACCOUNT, model: account })
  }

  editBalance(balance: Balance) {
    this.dialogs.push({ action: Action.EDIT, entity: Entity.BALANCE, model: balance })
  }

  editDeposit(deposit: Deposit) {
    this.dialogs.push({ action: Action.EDIT, entity: Entity.DEPOSIT, model: deposit })
  }
}

export const UIContext = React.createContext<UI>(new UI())