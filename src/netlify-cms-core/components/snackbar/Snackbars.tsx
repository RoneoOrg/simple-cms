import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { removeSnackbarById, selectSnackbars, SnackbarMessage } from '../../redux/slices/snackbars';

const Snackbars = () => {
  const [open, setOpen] = React.useState(false);
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined);

  const snackbars = useAppSelector(selectSnackbars);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (snackbars.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      const snackbar = { ...snackbars[0] };
      setMessageInfo(snackbar);
      dispatch(removeSnackbarById(snackbar.id));
      setOpen(true);
    } else if (snackbars.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackbars, messageInfo, open]);

  const handleClose = useCallback((_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  }, []);

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  return (
    <Snackbar
      key={messageInfo ? messageInfo.id : undefined}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      action={
        <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      }
    >
      {messageInfo ? (
        <Alert
          key="message"
          onClose={handleClose}
          severity={messageInfo.type}
          sx={{ width: '100%' }}
        >
          {messageInfo.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};

export default Snackbars;
