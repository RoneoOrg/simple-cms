import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { List } from 'immutable';
import React, { useCallback, useEffect, useMemo } from 'react';
import { translate } from 'react-polyglot';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { TranslatedProps } from '../../../interface';
import { checkBackendStatus } from '../../actions/status';
import QuickActionsDropdown from '../UI/QuickActionsDropdown';
import SettingsDropdown from '../UI/SettingsDropdown';

interface HeaderProps {
  user: any;
  collections: any[];
  onCreateEntryClick: (collectionName: string) => {};
  onLogoutClick: () => {};
  openMediaLibrary: () => {};
  displayUrl?: string;
  isTestRepo?: boolean;
  checkBackendStatus: () => {};
  showMediaButton?: boolean;
}

const Header = ({
  user,
  collections,
  onCreateEntryClick,
  onLogoutClick,
  openMediaLibrary,
  displayUrl,
  isTestRepo,
  t,
  checkBackendStatus,
  showMediaButton,
}: TranslatedProps<HeaderProps>) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkBackendStatus();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleCreatePostClick = useCallback((collectionName: string) => {
    if (onCreateEntryClick) {
      onCreateEntryClick(collectionName);
    }
  }, []);

  const createableCollections = useMemo(
    () => collections.filter((collection: any) => collection.create).toList(),
    [],
  );

  const { pathname } = useLocation();

  if (/\/collections\/[^\/]+\/(entries|new)/.test(pathname)) {
    return null;
  }

  return (
    <AppBar position="fixed" sx={{ '.MuiToolbar-root': { gap: 1.5 }, backgroundColor: '#fff' }}>
      <Toolbar>
        <Button
          component={Link}
          to="/"
          sx={{ color: pathname.startsWith('/collections') ? '#2196F3' : '#666' }}
          startIcon={
            <DescriptionIcon
              sx={{ color: pathname.startsWith('/collections') ? '#2196F3' : '#666' }}
            />
          }
        >
          {t('app.header.content')}
        </Button>
        {showMediaButton ? (
          <Button
            key="media-button"
            onClick={openMediaLibrary}
            sx={{ color: '#666' }}
            startIcon={<ImageIcon />}
          >
            {t('app.header.media')}
          </Button>
        ) : null}
        <Box sx={{ flexGrow: 1 }} />
        {createableCollections.size > 0 ? (
          <QuickActionsDropdown
            key="quick-actions"
            createableCollections={createableCollections}
            handleCreatePostClick={handleCreatePostClick}
          />
        ) : null}
        <SettingsDropdown
          displayUrl={displayUrl}
          isTestRepo={isTestRepo}
          imageUrl={user?.avatar_url}
          onLogoutClick={onLogoutClick}
        />
      </Toolbar>
    </AppBar>
  );
};

const mapDispatchToProps = {
  checkBackendStatus,
};

export default connect(null, mapDispatchToProps)(translate()(Header));
