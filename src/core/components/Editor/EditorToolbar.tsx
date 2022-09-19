import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';
import { translate } from 'react-polyglot';
import { Link } from 'react-router-dom';
import { TranslatedProps } from '../../../interface';
import { Collection } from '../../types/redux';
import { SettingsDropdown } from '../UI';
import ExistingSimplePublishControls from './toolbar/ExistingSimplePublishControls';
import NewSimplePublishControls from './toolbar/NewSimplePublishControls';

interface EditorToolbarProps {
  isPersisting?: boolean;
  onPersist?: () => void;
  onPersistAndNew?: () => void;
  onPersistAndDuplicate?: () => void;
  showDelete: boolean;
  onDelete?: () => void;
  onDuplicate?: () => void;
  user?: any;
  hasChanged?: boolean;
  displayUrl?: string;
  collection: Collection;
  isNewEntry?: boolean;
  onLogoutClick?: () => void;
  editorBackLink: string;
}

const EditorToolbar = ({
  isPersisting = false,
  onPersist = () => {},
  onPersistAndNew = () => {},
  onPersistAndDuplicate = () => {},
  showDelete,
  onDelete = () => {},
  onDuplicate = () => {},
  user = {},
  hasChanged = false,
  displayUrl = '',
  collection,
  isNewEntry = false,
  onLogoutClick = () => {},
  editorBackLink,
  t,
}: TranslatedProps<EditorToolbarProps>) => {
  const renderExistingEntrySimplePublishControls = (canCreate: boolean) => {
    return <ExistingSimplePublishControls canCreate={canCreate} onDuplicate={onDuplicate} />;
  };

  const renderNewEntrySimplePublishControls = (canCreate: boolean) => {
    return (
      <NewSimplePublishControls
        canCreate={canCreate}
        isPersisting={isPersisting}
        onPersist={onPersist}
        onPersistAndNew={onPersistAndNew}
        onPersistAndDuplicate={onPersistAndDuplicate}
      />
    );
  };

  const renderSimpleControls = () => {
    const canCreate = collection.create ?? false;

    return (
      <>
        {!isNewEntry && !hasChanged
          ? renderExistingEntrySimplePublishControls(canCreate)
          : renderNewEntrySimplePublishControls(canCreate)}
        <div key="delete-button">
          {showDelete ? (
            <Button onClick={onDelete} variant="contained" color="error">
              {t('editor.editorToolbar.deleteEntry')}
            </Button>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <AppBar
      position="fixed"
      sx={{ '.MuiToolbar-root': { gap: 1.5, pl: 0 }, backgroundColor: '#fff' }}
    >
      <Toolbar>
        <Button
          component={Link}
          startIcon={<ArrowBackIcon sx={{ color: '#333' }} />}
          to={editorBackLink}
          sx={{ textTransform: 'unset', ml: 0.5, pl: 2.5, gap: 1 }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ color: '#333' }}>
              {t('editor.editorToolbar.backCollection', {
                collectionLabel: collection.label,
              })}
            </Typography>
            {hasChanged ? (
              <Typography key="unsaved" variant="subtitle2" color="error.main">
                {t('editor.editorToolbar.unsavedChanges')}
              </Typography>
            ) : (
              <Typography key="saved" variant="subtitle2" color="success.main">
                {t('editor.editorToolbar.changesSaved')}
              </Typography>
            )}
          </Box>
        </Button>
        {renderSimpleControls()}
        <Box sx={{ flexGrow: 1 }} />
        <SettingsDropdown
          displayUrl={displayUrl}
          imageUrl={user?.avatar_url}
          onLogoutClick={onLogoutClick}
        />
      </Toolbar>
    </AppBar>
  );
};

export default translate()(EditorToolbar);
