import { Alert, Button, Card, CardContent, SxProps, TextField, Theme, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useCallback, useRef, useState } from 'react';
import { selectTarget, useBind } from '../../utils/hooks';
import { useStore } from '../../utils/mobx';

interface Props {
  sx?: SxProps<Theme>
}

export const Export = observer(function Export({ sx }: Props) {
  const [hasCopied, setCopied] = useState<boolean>()
  const clearCopied = useBind(setCopied, undefined)
  const exportRef = useRef<HTMLInputElement>()

  const serialized = useStore(store => JSON.stringify(store.snapshot))
  const exportString = btoa(serialized)

  const copyExport = useCallback(async () => {
    try {
      exportRef.current?.select()
      await navigator.clipboard.writeText(exportString)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }, [exportString])

  return (
    <Card sx={sx}>
      <CardContent>
        <Typography variant='h6' component='h2'>Export</Typography>
        <Typography sx={{ ml: 1, mt: 1 }}>Copy this text to another PC to export settings</Typography>
        <TextField
          InputProps={{
            endAdornment: (
              <Button
                onClick={copyExport}
                sx={{ ml: 1 }}
                variant='contained'>
                  Copy
              </Button>
            ),
          }}
          fullWidth
          inputRef={exportRef}
          label="Copy to export"
          onFocus={selectTarget}
          onBlur={clearCopied}
          sx={{ mt: 2 }}
          value={exportString}
        />
        {hasCopied === true && <Alert severity='success' sx={{ mt: 1 }}>Copied text to clipboard</Alert>}
        {hasCopied === false && <Alert severity='error' sx={{ mt: 1 }}>Automatic copy failed, please copy manually</Alert>}
      </CardContent>
    </Card>
  )
})
