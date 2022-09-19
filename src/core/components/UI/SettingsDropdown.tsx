import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { translate } from 'react-polyglot';
import { TranslatedProps } from '../../../interface';
import { stripProtocol } from '../../lib/urlHelper';

interface SettingsDropdownProps {
  displayUrl: string;
  imageUrl: string;
  onLogoutClick: () => void;
}

const SettingsDropdown = ({
  displayUrl,
  imageUrl,
  onLogoutClick,
  t,
}: TranslatedProps<SettingsDropdownProps>) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {displayUrl ? (
        <Button
          key="live-page"
          href={displayUrl}
          endIcon={<OpenInNewIcon />}
        >
          {stripProtocol(displayUrl)}
        </Button>
      ) : null}
      <div>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
        >
          {imageUrl ? <Avatar src={imageUrl} /> : <AccountCircleIcon fontSize="large" />}
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={onLogoutClick}>{t('ui.settingsDropdown.logOut')}</MenuItem>
        </Menu>
      </div>
    </>
  );
};

export default translate()(SettingsDropdown);
