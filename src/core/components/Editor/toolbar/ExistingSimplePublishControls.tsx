import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useCallback, useMemo } from 'react';
import { translate } from 'react-polyglot';
import { TranslatedProps } from '../../../../interface';

interface ExistingSimplePublishControlsProps {
  canCreate: boolean;
  onDuplicate: () => void;
}

const ExistingSimplePublishControls = ({
  canCreate,
  onDuplicate,
  t,
}: TranslatedProps<ExistingSimplePublishControlsProps>) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleOnDuplicate = useCallback(() => {
    handleClose();
    onDuplicate();
  }, [handleClose, onDuplicate]);

  if (!canCreate) {
    return (
      <Button key="publish-button" variant="contained">
        {t('editor.editorToolbar.published')}
      </Button>
    );
  }

  return (
    <>
      <Button
        key="publish-dropdown-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        {t('editor.editorToolbar.published')}
      </Button>
      <Menu
        key="publish-dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleOnDuplicate}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('editor.editorToolbar.duplicate')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default translate()(ExistingSimplePublishControls);
