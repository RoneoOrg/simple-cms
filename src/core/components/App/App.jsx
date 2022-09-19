import styled from '@emotion/styled';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { translate } from 'react-polyglot';
import { connect, Provider } from 'react-redux';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import TopBarProgress from 'react-topbar-progress-indicator';
import { colors, Loader } from '../../../ui-default';
import { loginUser, logoutUser } from '../../actions/auth';
import { createNewEntry } from '../../actions/collections';
import { openMediaLibrary } from '../../actions/mediaLibrary';
import { currentBackend } from '../../backend';
import { history } from '../../routing/history';
import { store } from '../../store';
import CollectionRoute from '../Collection/CollectionRoute';
import EditorRoute from '../Editor/EditorRoute';
import MediaLibrary from '../MediaLibrary/MediaLibrary';
import Snackbars from '../snackbar/Snackbars';
import './App.css';
import Header from './Header';
import NotFoundPage from './NotFoundPage';

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#03dac5'
    },
    disabled: {
      main: '#ccc',
      contrastText: '#fff',
    },
  },
});

TopBarProgress.config({
  barColors: {
    0: colors.active,
    '1.0': colors.active,
  },
  shadowBlur: 0,
  barThickness: 2,
});

const AppMainContainer = styled.div`
  min-width: 1200px;
  max-width: 1440px;
  margin: 0 auto;
`;

const ErrorContainer = styled.div`
  margin: 20px;
`;

const ErrorCodeBlock = styled.pre`
  margin-left: 20px;
  font-size: 15px;
  line-height: 1.5;
`;

function getDefaultPath(collections) {
  const first = collections.filter(collection => collection.hide !== true).first();
  if (first) {
    return `/collections/${first.name}`;
  } else {
    throw new Error('Could not find a non hidden collection');
  }
}

function CollectionSearchRedirect() {
  const { name } = useParams();
  return <Navigate to={`/collections/${name}`} />;
}

function EditEntityRedirect() {
  const { name, entryName } = useParams();
  return <Navigate to={`//collections/${name}/entries/${entryName}`} />;
}

class App extends React.Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    collections: ImmutablePropTypes.map.isRequired,
    loginUser: PropTypes.func.isRequired,
    logoutUser: PropTypes.func.isRequired,
    user: PropTypes.object,
    isFetching: PropTypes.bool.isRequired,
    siteId: PropTypes.string,
    useMediaLibrary: PropTypes.bool,
    openMediaLibrary: PropTypes.func.isRequired,
    showMediaButton: PropTypes.bool,
    t: PropTypes.func.isRequired,
  };

  configError(config) {
    const t = this.props.t;
    return (
      <ErrorContainer>
        <h1>{t('app.app.errorHeader')}</h1>
        <div>
          <strong>{t('app.app.configErrors')}:</strong>
          <ErrorCodeBlock>{config.error}</ErrorCodeBlock>
          <span>{t('app.app.checkConfigYml')}</span>
        </div>
      </ErrorContainer>
    );
  }

  handleLogin(credentials) {
    this.props.loginUser(credentials);
  }

  authenticating() {
    const { auth, t } = this.props;
    const backend = currentBackend(this.props.config);

    if (backend == null) {
      return (
        <div>
          <h1>{t('app.app.waitingBackend')}</h1>
        </div>
      );
    }

    return (
      <div>
        {React.createElement(backend.authComponent(), {
          onLogin: this.handleLogin.bind(this),
          error: auth.error,
          inProgress: auth.isFetching,
          siteId: this.props.config.backend.site_domain,
          base_url: this.props.config.backend.base_url,
          authEndpoint: this.props.config.backend.auth_endpoint,
          config: this.props.config,
          clearHash: () => history.replace('/'),
          t,
        })}
      </div>
    );
  }

  handleLinkClick(event, handler, ...args) {
    event.preventDefault();
    handler(...args);
  }

  render() {
    const {
      user,
      config,
      collections,
      logoutUser,
      isFetching,
      useMediaLibrary,
      openMediaLibrary,
      t,
      showMediaButton,
    } = this.props;

    if (config === null) {
      return null;
    }

    if (config.error) {
      return this.configError(config);
    }

    if (config.isFetching) {
      return <Loader active>{t('app.app.loadingConfig')}</Loader>;
    }

    if (user == null) {
      return (
        <Provider store={store}>
          <Snackbars />
          {this.authenticating(t)}
        </Provider>
      );
    }

    const defaultPath = getDefaultPath(collections);

    return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <Snackbars />
          <Header
            user={user}
            collections={collections}
            onCreateEntryClick={createNewEntry}
            onLogoutClick={logoutUser}
            openMediaLibrary={openMediaLibrary}
            displayUrl={config.display_url}
            isTestRepo={config.backend.name === 'test-repo'}
            showMediaButton={showMediaButton}
          />
          <AppMainContainer>
            {isFetching && <TopBarProgress />}
            <Routes>
              <Route path="/" element={<Navigate to={defaultPath} />} />
              <Route path="/search" element={<Navigate to={defaultPath} />} />
              <Route
                exact
                path="/collections/:name/search/"
                element={<CollectionSearchRedirect />}
              />
              <Route
                path="/error=access_denied&error_description=Signups+not+allowed+for+this+instance"
                element={<Navigate to={defaultPath} />}
              />
              <Route
                exact
                collections={collections}
                path="/collections/:name"
                element={<CollectionRoute collections={collections} />}
              />
              <Route
                path="/collections/:name/new"
                collections={collections}
                element={<EditorRoute collections={collections} newRecord />}
              />
              <Route
                path="/collections/:name/entries/:slug"
                collections={collections}
                element={<EditorRoute collections={collections} />}
              />
              <Route
                path="/collections/:name/search/:searchTerm"
                collections={collections}
                element={
                  <CollectionRoute collections={collections} isSearchResults isSingleSearchResult />
                }
              />
              <Route
                collections={collections}
                path="/collections/:name/filter/:filterTerm"
                element={<CollectionRoute collections={collections} />}
              />
              <Route
                path="/search/:searchTerm"
                element={<CollectionRoute collections={collections} isSearchResults />}
              />
              <Route
                path="/edit/:name/:entryName"
                collections={collections}
                element={<EditEntityRedirect />}
              />
              <Route component={NotFoundPage} />
            </Routes>
            {useMediaLibrary ? <MediaLibrary /> : null}
          </AppMainContainer>
        </Provider>
      </ThemeProvider>
    );
  }
}

function mapStateToProps(state) {
  const { auth, config, collections, globalUI, mediaLibrary } = state;
  const user = auth.user;
  const isFetching = globalUI.isFetching;
  const useMediaLibrary = !mediaLibrary.externalLibrary;
  const showMediaButton = mediaLibrary.showMediaButton;
  return {
    auth,
    config,
    collections,
    user,
    isFetching,
    showMediaButton,
    useMediaLibrary,
  };
}

const mapDispatchToProps = {
  openMediaLibrary,
  loginUser,
  logoutUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(App));
