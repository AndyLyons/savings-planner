import { observer } from 'mobx-react-lite';
import { Action, Entity } from '../state/UI';
import { useUI } from '../utils/mobx';
import { CreateAccount, EditAccount } from './accounts/AccountDialog';
import { CreateBalance, EditBalance } from './balance/BalanceDialog';
import { CreatePerson, EditPerson } from './people/PersonDialog';

export const Dialogs = observer(function Dialogs() {
  const ui = useUI()

  return (
    <>
      {ui.mode.action === Action.EDIT && ui.mode.entity === Entity.PERSON && <EditPerson person={ui.mode.model} onClose={ui.cancel} />}
      {ui.mode.action === Action.EDIT && ui.mode.entity === Entity.ACCOUNT && <EditAccount account={ui.mode.model} onClose={ui.cancel} />}
      {ui.mode.action === Action.EDIT && ui.mode.entity === Entity.BALANCE && <EditBalance balance={ui.mode.model} onClose={ui.cancel} />}
      {ui.mode.action === Action.CREATE && ui.mode.entity === Entity.PERSON && <CreatePerson initialValues={ui.mode.initialValues} onClose={ui.cancel} />}
      {ui.mode.action === Action.CREATE && ui.mode.entity === Entity.ACCOUNT && <CreateAccount initialValues={ui.mode.initialValues} onClose={ui.cancel} />}
      {ui.mode.action === Action.CREATE && ui.mode.entity === Entity.BALANCE && <CreateBalance initialValues={ui.mode.initialValues} onClose={ui.cancel} />}
    </>
  )
})