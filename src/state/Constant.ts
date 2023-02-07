import { YYYY } from '../utils/date';
import { Store } from './Store';

enum ConstantType {
  NUMBER = 'number',
  DATE = 'date'
}

type ValueType<T extends ConstantType> =
  T extends ConstantType.NUMBER ? number :
  T extends ConstantType.DATE ? YYYY :
  never

export class Constant {
  store: Store

  type: ConstantType
  value: ValueType<typeof this.type>

  constructor(store: Store, { type, value }: Pick<Constant, 'type' | 'value'>) {
    this.store = store

    this.type = type
    this.value = value
  }
}