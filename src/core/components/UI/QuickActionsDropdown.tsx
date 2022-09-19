import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { List } from 'immutable';
import React, { useCallback, useMemo } from 'react';
import { translate } from 'react-polyglot';
import { TranslatedProps } from '../../../interface';
import { Collection } from '../../types/redux';

interface QuickActionsDropdownProps {
  createableCollections: Collection[];
  handleCreatePostClick: (name: string) => void;
}

const QuickActionsDropdown = ({
  createableCollections,
  handleCreatePostClick,
  t,
}: TranslatedProps<QuickActionsDropdownProps>) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleMenuItemClick = useCallback(
    (collection: Collection) => () => {
      handleClose();
      handleCreatePostClick(collection.name);
    },
    [handleClose],
  );

  return (
    <>
      <Button
        key="quick-action-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        {t('app.header.quickAdd')}
      </Button>
      <Menu
        key="quick-action-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {createableCollections.map(collection => (
          <MenuItem key={collection.name} onClick={handleMenuItemClick(collection)}>
            {collection.label_singular || collection.label}
          </MenuItem>
        ))}
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default translate()(QuickActionsDropdown);
