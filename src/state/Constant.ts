import { YYYY, YYYYMM } from '../utils/date';
import { Store } from './Store';

class BaseConstant<T> {
  store: Store
  value: T

  constructor(store: Store, { value }: { value: T }) {
    this.store = store

    this.value = value
  }
}

export class NumberConstant extends BaseConstant<number> {}
export class YYYYMMConstant extends BaseConstant<YYYYMM> {}
export class YYYYConstant extends BaseConstant<YYYY> {}
export class DurationConstant extends BaseConstant<number> {}

export type Constant = NumberConstant | YYYYMMConstant | YYYYConstant | DurationConstant

/* TODO

- models for different values e.g. NumberValue, DateValue, YearValue, DurationValue(is this just a NumberValue?)
- a value contains an array of 'operations' and 'operands'
- wherever user needs to enter a number they can instead enter 'advanced mode' where they can configure the operands/operators
- .value prop which runs the operation chain to get the value
- operation chain could just be a simple single number (which is how basic mode is implemented)
- every value in the app uses one of these model classes rather than the primitive

*/