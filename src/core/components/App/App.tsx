import styled from '@emotion/styled';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { translate } from 'react-polyglot';
import { connect, Provider } from 'react-redux';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import TopBarProgress from 'react-topbar-progress-indicator';
import { TranslatedProps } from '../../../interface';
import { colors, Loader } from '../../../ui-default';
import { loginUser, logoutUser } from '../../actions/auth';
import { createNewEntry } from '../../actions/collections';
import { openMediaLibrary } from '../../actions/mediaLibrary';
import { currentBackend } from '../../backend';
import { history } from '../../routing/history';
import { store } from '../../store';
import { Collections, State } from '../../types/redux';
import CollectionRoute from '../Collection/CollectionRoute';
import EditorRoute from '../Editor/EditorRoute';
import MediaLibrary from '../MediaLibrary/MediaLibrary';
import Snackbars from '../snackbar/Snackbars';
import './App.css';
import Header from './Header';
import NotFoundPage from './NotFoundPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#03dac5',
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

function getDefaultPath(collections: Collections) {
  const first = Object.values(collections).filter(collection => collection.hide !== true)[0];
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

interface AppProps {
  auth: any;
  config: any;
  collections: Collections;
  loginUser: (credentials: any) => void;
  logoutUser: () => void;
  user?: any;
  isFetching: boolean;
  siteId?: string;
  useMediaLibrary?: boolean;
  openMediaLibrary: () => void;
  showMediaButton?: boolean;
}

const App = ({
  auth,
  config,
  collections,
  loginUser,
  logoutUser,
  user,
  isFetching = false,
  useMediaLibrary,
  openMediaLibrary,
  showMediaButton,
  t,
}: TranslatedProps<AppProps>) => {
  const configError = () => {
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
  };

  const handleLogin = (credentials: any) => {
    loginUser(credentials);
  };

  const authenticating = () => {
    const backend = currentBackend(config);

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
          onLogin: handleLogin,
          error: auth.error,
          inProgress: auth.isFetching,
          siteId: config.backend.site_domain,
          base_url: config.backend.base_url,
          authEndpoint: config.backend.auth_endpoint,
          config: config,
          clearHash: () => history.replace('/'),
          t,
        })}
      </div>
    );
  };

  if (config === null) {
    return null;
  }

  if (config.error) {
    return configError();
  }

  if (config.isFetching) {
    return <Loader $active>{t('app.app.loadingConfig')}</Loader>;
  }

  if (user == null) {
    return (
      <Provider store={store}>
        <Snackbars />
        {authenticating()}
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
            <Route path="/collections/:name/search/" element={<CollectionSearchRedirect />} />
            <Route
              path="/error=access_denied&error_description=Signups+not+allowed+for+this+instance"
              element={<Navigate to={defaultPath} />}
            />
            <Route
              path="/collections/:name"
              element={<CollectionRoute collections={collections} />}
            />
            <Route
              path="/collections/:name/new"
              element={<EditorRoute collections={collections} newRecord />}
            />
            <Route
              path="/collections/:name/entries/:slug"
              element={<EditorRoute collections={collections} />}
            />
            <Route
              path="/collections/:name/search/:searchTerm"
              element={
                <CollectionRoute collections={collections} isSearchResults isSingleSearchResult />
              }
            />
            <Route
              path="/collections/:name/filter/:filterTerm"
              element={<CollectionRoute collections={collections} />}
            />
            <Route
              path="/search/:searchTerm"
              element={<CollectionRoute collections={collections} isSearchResults />}
            />
            <Route path="/edit/:name/:entryName" element={<EditEntityRedirect />} />
            <Route element={NotFoundPage} />
          </Routes>
          {useMediaLibrary ? <MediaLibrary /> : null}
        </AppMainContainer>
      </Provider>
    </ThemeProvider>
  );
};

function mapStateToProps(state: State) {
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
