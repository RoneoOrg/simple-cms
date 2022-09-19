import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { translate } from 'react-polyglot';
import { connect } from 'react-redux';
import { Loader } from '../../../ui-default';
import { logoutUser } from '../../actions/auth';
import {
  changeDraftField,
  changeDraftFieldValidation,
  createDraftDuplicateFromEntry,
  createEmptyDraft,
  deleteEntry,
  deleteLocalBackup,
  discardDraft,
  loadEntries,
  loadEntry,
  loadLocalBackup,
  persistEntry,
  persistLocalBackup,
  retrieveLocalBackup,
} from '../../actions/entries';
import { selectEntry } from '../../reducers';
import { selectFields } from '../../reducers/collections';
import { history, navigateToCollection, navigateToNewEntry } from '../../routing/history';
import EditorInterface from './EditorInterface';

export class Editor extends React.Component {
  static propTypes = {
    changeDraftField: PropTypes.func.isRequired,
    changeDraftFieldValidation: PropTypes.func.isRequired,
    collection: ImmutablePropTypes.map.isRequired,
    createDraftDuplicateFromEntry: PropTypes.func.isRequired,
    createEmptyDraft: PropTypes.func.isRequired,
    discardDraft: PropTypes.func.isRequired,
    entry: ImmutablePropTypes.map,
    entryDraft: ImmutablePropTypes.map.isRequired,
    loadEntry: PropTypes.func.isRequired,
    persistEntry: PropTypes.func.isRequired,
    deleteEntry: PropTypes.func.isRequired,
    showDelete: PropTypes.bool.isRequired,
    fields: ImmutablePropTypes.list.isRequired,
    slug: PropTypes.string,
    newEntry: PropTypes.bool.isRequired,
    displayUrl: PropTypes.string,
    isModification: PropTypes.bool,
    collectionEntriesLoaded: PropTypes.bool,
    logoutUser: PropTypes.func.isRequired,
    loadEntries: PropTypes.func.isRequired,
    user: PropTypes.object,
    location: PropTypes.shape({
      pathname: PropTypes.string,
      search: PropTypes.string,
    }),
    hasChanged: PropTypes.bool,
    t: PropTypes.func.isRequired,
    retrieveLocalBackup: PropTypes.func.isRequired,
    localBackup: ImmutablePropTypes.map,
    loadLocalBackup: PropTypes.func,
    persistLocalBackup: PropTypes.func.isRequired,
    deleteLocalBackup: PropTypes.func,
  };

  componentDidMount() {
    const {
      newEntry,
      collection,
      slug,
      loadEntry,
      createEmptyDraft,
      loadEntries,
      retrieveLocalBackup,
      collectionEntriesLoaded,
      t,
    } = this.props;

    retrieveLocalBackup(collection, slug);

    if (newEntry) {
      createEmptyDraft(collection, this.props.location.search);
    } else {
      loadEntry(collection, slug);
    }

    const leaveMessage = t('editor.editor.onLeavePage');

    this.exitBlocker = event => {
      if (this.props.entryDraft.hasChanged) {
        // This message is ignored in most browsers, but its presence
        // triggers the confirmation dialog
        event.returnValue = leaveMessage;
        return leaveMessage;
      }
    };
    window.addEventListener('beforeunload', this.exitBlocker);

    const navigationBlocker = (location, action) => {
      /**
       * New entry being saved and redirected to it's new slug based url.
       */
      const isPersisting = this.props.entryDraft.getIn(['entry', 'isPersisting']);
      const newRecord = this.props.entryDraft.getIn(['entry', 'newRecord']);
      const newEntryPath = `/collections/${collection.name}/new`;
      if (
        isPersisting &&
        newRecord &&
        this.props.location.pathname === newEntryPath &&
        action === 'PUSH'
      ) {
        return;
      }

      if (this.props.hasChanged) {
        return leaveMessage;
      }
    };

    const unblock = history.block(navigationBlocker);

    /**
     * This will run as soon as the location actually changes, unless creating
     * a new post. The confirmation above will run first.
     */
    this.unlisten = history.listen((location, action) => {
      const newEntryPath = `/collections/${collection.name}/new`;
      const entriesPath = `/collections/${collection.name}/entries/`;
      const { pathname } = location;
      if (
        pathname.startsWith(newEntryPath) ||
        (pathname.startsWith(entriesPath) && action === 'PUSH')
      ) {
        return;
      }

      this.deleteBackup();

      unblock();
      this.unlisten();
    });

    if (!collectionEntriesLoaded) {
      loadEntries(collection);
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.localBackup && this.props.localBackup) {
      const confirmLoadBackup = window.confirm(this.props.t('editor.editor.confirmLoadBackup'));
      if (confirmLoadBackup) {
        this.props.loadLocalBackup();
      } else {
        this.deleteBackup();
      }
    }

    if (this.props.hasChanged) {
      this.createBackup(this.props.entryDraft['entry'], this.props.collection);
    }

    if (prevProps.entry === this.props.entry) return;

    const { newEntry, collection } = this.props;

    if (newEntry) {
      prevProps.createEmptyDraft(collection, this.props.location.search);
    }
  }

  componentWillUnmount() {
    this.createBackup.flush();
    this.props.discardDraft();
    window.removeEventListener('beforeunload', this.exitBlocker);
  }

  createBackup = debounce(function (entry, collection) {
    this.props.persistLocalBackup(entry, collection);
  }, 2000);

  handleChangeDraftField = (field, value, metadata, i18n) => {
    const entries = [this.props.publishedEntry].filter(Boolean);
    this.props.changeDraftField({ field, value, metadata, entries, i18n });
  };

  deleteBackup() {
    const { deleteLocalBackup, collection, slug, newEntry } = this.props;
    this.createBackup.cancel();
    deleteLocalBackup(collection, !newEntry && slug);
  }

  handlePersistEntry = async (opts = {}) => {
    const { createNew = false, duplicate = false } = opts;
    const { persistEntry, collection, loadEntry, slug, createDraftDuplicateFromEntry, entryDraft } =
      this.props;

    await persistEntry(collection);

    this.deleteBackup();

    if (createNew) {
      navigateToNewEntry(collection.name);
      duplicate && createDraftDuplicateFromEntry(entryDraft['entry']);
    }
  };

  handlePublishEntry = async (opts = {}) => {
    const { createNew = false, duplicate = false } = opts;
    const { createDraftDuplicateFromEntry, entryDraft, collection, slug, t } = this.props;
    if (entryDraft.hasChanged) {
      window.alert(t('editor.editor.onPublishingWithUnsavedChanges'));
      return;
    } else if (!window.confirm(t('editor.editor.onPublishing'))) {
      return;
    }

    this.deleteBackup();

    if (createNew) {
      navigateToNewEntry(collection.name);
    }

    duplicate && createDraftDuplicateFromEntry(entryDraft['entry']);
  };

  handleDuplicateEntry = () => {
    const { createDraftDuplicateFromEntry, collection, entryDraft } = this.props;

    navigateToNewEntry(collection.name);
    createDraftDuplicateFromEntry(entryDraft['entry']);
  };

  handleDeleteEntry = () => {
    const { entryDraft, newEntry, collection, deleteEntry, slug, t } = this.props;
    if (entryDraft.hasChanged) {
      if (!window.confirm(t('editor.editor.onDeleteWithUnsavedChanges'))) {
        return;
      }
    } else if (!window.confirm(t('editor.editor.onDeletePublishedEntry'))) {
      return;
    }
    if (newEntry) {
      return navigateToCollection(collection.name);
    }

    setTimeout(async () => {
      await deleteEntry(collection, slug);
      this.deleteBackup();
      return navigateToCollection(collection.name);
    }, 0);
  };

  render() {
    const {
      entry,
      entryDraft,
      fields,
      collection,
      changeDraftFieldValidation,
      user,
      hasChanged,
      displayUrl,
      newEntry,
      isModification,
      logoutUser,
      draftKey,
      slug,
      t,
      editorBackLink,
    } = this.props;

    const isPublished = !newEntry;

    if (entry && entry.error) {
      return (
        <div>
          <h3>{entry.error}</h3>
        </div>
      );
    } else if (
      entryDraft == null ||
      entryDraft['entry'] === undefined ||
      (entry && entry.isFetching)
    ) {
      return <Loader active>{t('editor.editor.loadingEntry')}</Loader>;
    }

    return (
      <EditorInterface
        draftKey={draftKey}
        entry={entryDraft['entry']}
        collection={collection}
        fields={fields}
        fieldsMetaData={entryDraft.fieldsMetaData}
        fieldsErrors={entryDraft.fieldsErrors}
        onChange={this.handleChangeDraftField}
        onValidate={changeDraftFieldValidation}
        onPersist={this.handlePersistEntry}
        onDelete={this.handleDeleteEntry}
        onPublish={this.handlePublishEntry}
        onDuplicate={this.handleDuplicateEntry}
        showDelete={this.props.showDelete}
        user={user}
        hasChanged={hasChanged}
        displayUrl={displayUrl}
        isNewEntry={newEntry}
        isModification={isModification}
        onLogoutClick={logoutUser}
        editorBackLink={editorBackLink}
        t={t}
      />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { collections, entryDraft, auth, config, entries, globalUI } = state;
  const slug = ownProps.slug;
  const collection = collections.get(ownProps.name);
  const collectionName = collection.name;
  const newEntry = ownProps.newRecord === true;
  const fields = selectFields(collection, slug);
  const entry = newEntry ? null : selectEntry(state, collectionName, slug);
  const user = auth.user;
  const hasChanged = entryDraft.hasChanged;
  const displayUrl = config.display_url;
  const isModification = entryDraft.getIn(['entry', 'isModification']);
  const collectionEntriesLoaded = !!entries.getIn(['pages', collectionName]);
  const publishedEntry = selectEntry(state, collectionName, slug);
  const localBackup = entryDraft.localBackup;
  const draftKey = entryDraft.key;
  let editorBackLink = `/collections/${collectionName}`;
  if (collection.nested && slug) {
    const pathParts = slug.split('/');
    if (pathParts.length > 2) {
      editorBackLink = `${editorBackLink}/filter/${pathParts.slice(0, -2).join('/')}`;
    }
  }

  return {
    collection,
    collections,
    newEntry,
    entryDraft,
    fields,
    slug,
    entry,
    user,
    hasChanged,
    displayUrl,
    isModification,
    collectionEntriesLoaded,
    localBackup,
    draftKey,
    publishedEntry,
    editorBackLink,
  };
}

const mapDispatchToProps = {
  changeDraftField,
  changeDraftFieldValidation,
  loadEntry,
  loadEntries,
  loadLocalBackup,
  retrieveLocalBackup,
  persistLocalBackup,
  deleteLocalBackup,
  createDraftDuplicateFromEntry,
  createEmptyDraft,
  discardDraft,
  persistEntry,
  deleteEntry,
  logoutUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Editor));
