import { observer } from 'mobx-react-lite';
import { Action, Entity } from '../state/UI';
import { useUI } from '../utils/mobx';
import { CreateAccount, EditAccount } from './accounts/AccountDialog';
import { CreateBalance, EditBalance } from './balance/BalanceDialog';
import { CreateDeposit, EditDeposit } from './deposit/DepositDialog';
import { CreatePerson, EditPerson } from './people/PersonDialog';

export const Dialogs = observer(function Dialogs() {
  const ui = useUI()

  return (
    <>
      {ui.dialogs.map(dialog =>
        <>
          {dialog.action === Action.EDIT && dialog.entity === Entity.PERSON && <EditPerson person={dialog.model} onClose={ui.cancel} />}
          {dialog.action === Action.EDIT && dialog.entity === Entity.ACCOUNT && <EditAccount account={dialog.model} onClose={ui.cancel} />}
          {dialog.action === Action.EDIT && dialog.entity === Entity.BALANCE && <EditBalance balance={dialog.model} onClose={ui.cancel} />}
          {dialog.action === Action.EDIT && dialog.entity === Entity.DEPOSIT && <EditDeposit deposit={dialog.model} onClose={ui.cancel} />}
          {dialog.action === Action.CREATE && dialog.entity === Entity.PERSON && <CreatePerson initialValues={dialog.initialValues} onClose={ui.cancel} />}
          {dialog.action === Action.CREATE && dialog.entity === Entity.ACCOUNT && <CreateAccount initialValues={dialog.initialValues} onClose={ui.cancel} />}
          {dialog.action === Action.CREATE && dialog.entity === Entity.BALANCE && <CreateBalance initialValues={dialog.initialValues} onClose={ui.cancel} />}
          {dialog.action === Action.CREATE && dialog.entity === Entity.DEPOSIT && <CreateDeposit initialValues={dialog.initialValues} onClose={ui.cancel} />}
        </>
      )}
    </>
  )
})