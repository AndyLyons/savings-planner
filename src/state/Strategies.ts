import { makeAutoObservable } from 'mobx'
import { keys } from '../utils/fn'
import type { Store } from './Store'
import type { StrategyDetails, StrategyId } from './Strategy'
import { Strategy } from './Strategy'

export type StrategiesJSON = typeof Strategies.prototype.json

export class Strategies {
  store: Store

  data: Record<StrategyId, Strategy> = {}

  constructor(store: Store) {
    makeAutoObservable(this, { store: false }, { autoBind: true })

    this.store = store
  }

  get keys() {
    return keys(this.data)
  }

  get values() {
    return Object.values(this.data)
  }

  createStrategy(details: Omit<StrategyDetails, 'id'>) {
    const strategy = Strategy.create(this.store, details)
    this.addStrategy(strategy)
  }

  addStrategy(strategy: Strategy) {
    this.data[strategy.id] = strategy
  }

  clear() {
    this.keys.forEach(key => {
      delete this.data[key]
    })
  }

  getStrategy(strategyId: StrategyId): Strategy {
    return this.data[strategyId]
  }

  isStrategyId(strategyId: string | undefined): strategyId is StrategyId {
    return strategyId !== undefined && strategyId in this.data
  }

  removeStrategy(strategy: Strategy): void
  removeStrategy(strategyId: StrategyId): void
  removeStrategy(strategyOrId: Strategy | StrategyId) {
    const id = typeof strategyOrId === 'string' ? strategyOrId : strategyOrId.id
    delete this.data[id]
  }

  restoreSnapshot(snapshot: StrategiesJSON) {
    this.clear()

    snapshot
      .map(strategy => Strategy.fromJSON(this.store, strategy))
      .forEach(this.addStrategy)
  }

  get json() {
    return this.values.map(strategy => strategy.toJSON())
  }

  toJSON() {
    return this.json
  }
}