import { Alert, Button, Card, CardContent, SxProps, TextField, Theme, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';
import { ChangeEvent, selectTarget } from '../../utils/hooks';
import { useAction } from '../../utils/mobx';

interface Props {
  sx?: SxProps<Theme>
}

export const Import = observer(function Import({ sx }: Props) {
  const [importedString, setImportedString] = useState('')
  const [hasImportSucceeded, setImportSucceeded] = useState<boolean>()

  const onImportStringChanged = useCallback((e: ChangeEvent) => {
    setImportedString(e.target.value)
    setImportSucceeded(undefined)
  }, [setImportedString])

  const applySettings = useAction((store) => {
    try {
      const decodedImportString = atob(importedString)
      const parsedImportString = JSON.parse(decodedImportString)
      store.restore(parsedImportString, false)
      setImportedString('')
      setImportSucceeded(true)
    } catch(e) {
      console.error(e);
      setImportSucceeded(false)
    }
  }, [importedString])

  return (
    <Card sx={sx}>
      <CardContent>
        <Typography variant='h6' component='h2'>Import</Typography>
        <Typography sx={{ ml: 1, mt: 1 }}>Paste the text from another PC to import settings</Typography>
        <TextField
          InputProps={{
            endAdornment: (
              <Button
                disabled={importedString === ''}
                onClick={applySettings}
                sx={{ ml: 1 }}
                variant='contained'
              >
          Import
              </Button>
            )
          }}
          InputLabelProps={{
            shrink: true
          }}
          fullWidth
          label="Paste to import"
          onChange={onImportStringChanged}
          onFocus={selectTarget}
          sx={{ mt: 2 }}
          value={importedString}
        />
        {hasImportSucceeded === true && <Alert severity='success' sx={{ mt: 1 }}>Imported settings successfully!</Alert>}
        {hasImportSucceeded === false && <Alert severity='error' sx={{ mt: 1 }}>Failed to import settings</Alert>}
      </CardContent>
    </Card>
  )
})