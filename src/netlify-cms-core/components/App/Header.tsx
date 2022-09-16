import styled from '@emotion/styled';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import Button from '@mui/material/Button';
import { List } from 'immutable';
import React, { useCallback, useEffect, useMemo } from 'react';
import type { t } from 'react-polyglot';
import { translate } from 'react-polyglot';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  buttons,
  colors,
  Dropdown,
  DropdownItem,
  lengths,
  shadows,
  StyledDropdownButton,
  zIndex,
} from '../../../netlify-cms-ui-default';
import { checkBackendStatus } from '../../actions/status';
import { SettingsDropdown } from '../UI';

const AppHeader = styled.header`
  ${shadows.dropMain};
  position: sticky;
  width: 100%;
  top: 0;
  background-color: ${colors.foreground};
  z-index: ${zIndex.zIndex300};
  height: ${lengths.topBarHeight};
`;

const AppHeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 1200px;
  max-width: 1440px;
  padding: 0 12px;
  margin: 0 auto;
`;

const AppHeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
`;

const AppHeaderQuickNewButton = styled(StyledDropdownButton)`
  ${buttons.button};
  ${buttons.medium};
  ${buttons.gray};
  margin-right: 8px;

  &:after {
    top: 11px;
  }
`;

const AppHeaderNavList = styled.ul`
  display: flex;
  margin: 0;
  list-style: none;
`;

interface HeaderProps {
  user: any;
  collections: List<any>;
  onCreateEntryClick: (collectionName: string) => {};
  onLogoutClick: () => {};
  openMediaLibrary: () => {};
  hasWorkflow: boolean;
  displayUrl?: string;
  isTestRepo?: boolean;
  t: t;
  checkBackendStatus: () => {};
  showMediaButton?: boolean;
}

const Header = ({
  user,
  collections,
  onCreateEntryClick,
  onLogoutClick,
  openMediaLibrary,
  hasWorkflow,
  displayUrl,
  isTestRepo,
  t,
  checkBackendStatus,
  showMediaButton,
}: HeaderProps) => {
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
    () => collections.filter((collection: any) => collection.get('create')).toList(),
    [],
  );

  return (
    <AppHeader>
      <AppHeaderContent>
        <nav>
          <AppHeaderNavList>
            <li>
              <Button component={Link} to="/worklow" startIcon={<DescriptionIcon />}>
                {t('app.header.content')}
              </Button>
            </li>
            {hasWorkflow && (
              <li key="workflow-button">
                <Button
                  component={Link}
                  to="/workflow"
                  startIcon={<LeaderboardIcon sx={{ transform: 'scaleY(-1);' }} />}
                >
                  {t('app.header.workflow')}
                </Button>
              </li>
            )}
            {showMediaButton && (
              <li key="media-button">
                <Button onClick={openMediaLibrary} startIcon={<ImageIcon />}>
                  {t('app.header.media')}
                </Button>
              </li>
            )}
          </AppHeaderNavList>
        </nav>
        <AppHeaderActions>
          {createableCollections.size > 0 && (
            <Dropdown
              renderButton={() => (
                <AppHeaderQuickNewButton> {t('app.header.quickAdd')}</AppHeaderQuickNewButton>
              )}
              dropdownTopOverlap="30px"
              dropdownWidth="160px"
              dropdownPosition="left"
            >
              {createableCollections.map(collection => (
                <DropdownItem
                  key={collection.get('name')}
                  label={collection.get('label_singular') || collection.get('label')}
                  onClick={() => handleCreatePostClick(collection.get('name'))}
                />
              ))}
            </Dropdown>
          )}
          <SettingsDropdown
            displayUrl={displayUrl}
            isTestRepo={isTestRepo}
            imageUrl={user?.avatar_url}
            onLogoutClick={onLogoutClick}
          />
        </AppHeaderActions>
      </AppHeaderContent>
    </AppHeader>
  );
};

const mapDispatchToProps = {
  checkBackendStatus,
};

export default connect(null, mapDispatchToProps)(translate()(Header));
