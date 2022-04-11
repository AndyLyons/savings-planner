/**
 * Global UI state - unpersisted
 */

import { makeAutoObservable } from 'mobx'
import React from 'react'
import { Account, AccountJSON } from './Account'
import { Balance, BalanceJSON } from './Balance'
import { Person, PersonJSON } from './Person'

export enum Action {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  NONE = 'NONE'
}

export enum Entity {
  ACCOUNT = 'ACCOUNT',
  BALANCE = 'BALANCE',
  PERSON = 'PERSON'
}

interface CreatePerson {
  action: Action.CREATE,
  entity: Entity.PERSON
  initialValues?: Partial<PersonJSON>
}

interface CreateBalance {
  action: Action.CREATE
  entity: Entity.BALANCE
  initialValues?: Partial<BalanceJSON>
}

interface CreateAccount {
  action: Action.CREATE
  entity: Entity.ACCOUNT
  initialValues?: Partial<AccountJSON>
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

interface None {
  action: Action.NONE
}

type Mode = CreatePerson | CreateAccount | CreateBalance | EditPerson | EditAccount | EditBalance | None

const NO_MODE = { action: Action.NONE } as const

export class UI {
  mode: Mode = NO_MODE

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  cancel() {
    this.mode = NO_MODE
  }

  createPerson() {
    this.mode = { action: Action.CREATE, entity: Entity.PERSON }
  }

  createPersonFrom(initialValues: Partial<PersonJSON>) {
    this.mode = { action: Action.CREATE, entity: Entity.PERSON, initialValues }
  }

  createAccount() {
    this.mode = { action: Action.CREATE, entity: Entity.ACCOUNT }
  }

  createAccountFrom(initialValues: Partial<AccountJSON>) {
    this.mode = { action: Action.CREATE, entity: Entity.ACCOUNT, initialValues }
  }

  createBalance() {
    this.mode = { action: Action.CREATE, entity: Entity.BALANCE }
  }

  createBalanceFrom(initialValues: Partial<BalanceJSON>) {
    this.mode = { action: Action.CREATE, entity: Entity.BALANCE, initialValues }
  }

  editPerson(person: Person) {
    this.mode = { action: Action.EDIT, entity: Entity.PERSON, model: person }
  }

  editAccount(account: Account) {
    this.mode = { action: Action.EDIT, entity: Entity.ACCOUNT, model: account }
  }

  editBalance(balance: Balance) {
    this.mode = { action: Action.EDIT, entity: Entity.BALANCE, model: balance }
  }
}

export const UIContext = React.createContext<UI>(new UI())