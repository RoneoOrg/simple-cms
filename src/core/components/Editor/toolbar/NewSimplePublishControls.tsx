import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useCallback, useMemo } from 'react';
import { translate } from 'react-polyglot';
import { TranslatedProps } from '../../../../interface';

interface NewSimplePublishControlsProps {
  isPersisting: boolean;
  canCreate: boolean;
  onPersist: () => void;
  onPersistAndNew: () => void;
  onPersistAndDuplicate: () => void;
}

const NewSimplePublishControls = ({
  isPersisting,
  canCreate,
  onPersist,
  onPersistAndNew,
  onPersistAndDuplicate,
  t,
}: TranslatedProps<NewSimplePublishControlsProps>) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleOnPersist = useCallback(() => {
    handleClose();
    onPersist();
  }, [handleClose, onPersist]);

  const handleOnPersistAndNew = useCallback(() => {
    handleClose();
    onPersistAndNew();
  }, [handleClose, onPersistAndNew]);

  const handleOnPersistAndDuplicate = useCallback(() => {
    handleClose();
    onPersistAndDuplicate();
  }, [handleClose, onPersistAndDuplicate]);

  return (
    <>
      <Button
        key="new-publish-dropdown-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        {isPersisting ? t('editor.editorToolbar.publishing') : t('editor.editorToolbar.publish')}
      </Button>
      <Menu
        key="new-publish-dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleOnPersist}>
          <ListItemIcon>
            <ChevronRightIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('editor.editorToolbar.publishNow')}</ListItemText>
        </MenuItem>
        {canCreate
          ? [
              <MenuItem key="persist-and-new" onClick={handleOnPersistAndNew}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('editor.editorToolbar.publishAndCreateNew')}</ListItemText>
              </MenuItem>,
              <MenuItem key="persist-and-duplicate" onClick={handleOnPersistAndDuplicate}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('editor.editorToolbar.publishAndDuplicate')}</ListItemText>
              </MenuItem>,
            ]
          : null}
      </Menu>
    </>
  );
};

export default translate()(NewSimplePublishControls);
