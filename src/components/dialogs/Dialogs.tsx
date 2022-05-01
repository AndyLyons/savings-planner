import { observer } from 'mobx-react-lite';
import { Fragment } from 'react';
import { DialogType } from '../../state/Dialogs';
import { useStore } from '../../utils/mobx';
import { AccountDialog } from './AccountDialog';
import { BalanceDialog } from './BalanceDialog';
import { DepositDialog } from './DepositDialog';
import { PersonDialog } from './PersonDialog';
import { StrategyDialog } from './StrategyDialog';
import { WithdrawalDialog } from './WithdrawalDialog';

export const Dialogs = observer(function Dialogs() {
  const store = useStore()

  return (
    <>
      {store.dialogs.stack.map((dialog, index) =>
        <Fragment key={index}>
          {dialog.type === DialogType.PERSON && (
            <PersonDialog
              initialValues={dialog.initialValues}
              onDelete={dialog.onDelete}
              onDone={dialog.onDone}
              onClose={store.dialogs.close}
            />
          )}
          {dialog.type === DialogType.ACCOUNT && (
            <AccountDialog
              initialValues={dialog.initialValues}
              onDelete={dialog.onDelete}
              onDone={dialog.onDone}
              onClose={store.dialogs.close}
            />
          )}
          {dialog.type === DialogType.BALANCE && (
            <BalanceDialog
              initialValues={dialog.initialValues}
              onDelete={dialog.onDelete}
              onDone={dialog.onDone}
              onClose={store.dialogs.close}
            />
          )}
          {dialog.type === DialogType.STRATEGY && (
            <StrategyDialog
              initialValues={dialog.initialValues}
              onDelete={dialog.onDelete}
              onDone={dialog.onDone}
              onClose={store.dialogs.close}
            />
          )}
          {dialog.type === DialogType.DEPOSIT && (
            <DepositDialog
              initialValues={dialog.initialValues}
              onDelete={dialog.onDelete}
              onDone={dialog.onDone}
              onClose={store.dialogs.close}
            />
          )}
          {dialog.type === DialogType.WITHDRAWAL && (
            <WithdrawalDialog
              initialValues={dialog.initialValues}
              onDelete={dialog.onDelete}
              onDone={dialog.onDone}
              onClose={store.dialogs.close}
            />
          )}
        </Fragment>
      )}
    </>
  )
})