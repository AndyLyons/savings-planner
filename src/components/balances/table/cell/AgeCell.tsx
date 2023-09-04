import { observer } from "mobx-react-lite"
import { PersonId } from "../../../../state/Person"
import { YYYYMM } from "../../../../utils/date"
import { useStore } from "../../../../utils/mobx"

export const AgeCell = observer(function AgeCell({ date, personId }: { date: YYYYMM, personId: PersonId }) {
  const age = useStore(store => store.people.get(personId).getAge(date))
  return <div className='table-cell table-column--age'>{age}</div>
})