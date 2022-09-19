import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18n } from 'react-polyglot';
import { connect, Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import 'what-input';
import { authenticateUser } from './actions/auth';
import { loadConfig } from './actions/config';
import App from './components/App/App';
import './components/EditorWidgets';
import { ErrorBoundary } from './components/UI';
import { getPhrases } from './lib/phrases';
import './mediaLibrary';
import { selectLocale } from './reducers/config';
import { store } from './store';
import { State, CmsConfig } from './types/redux';

const ROOT_ID = 'nc-root';

interface TranslatedAppProps {
  locale: any;
  config: CmsConfig;
}

function TranslatedApp({ locale, config }: TranslatedAppProps) {
  return (
    <I18n locale={locale} messages={getPhrases(locale)}>
      <ErrorBoundary showBackup config={config}>
        <Router>
          <App />
        </Router>
      </ErrorBoundary>
    </I18n>
  );
}

function mapDispatchToProps(state: State) {
  return { locale: selectLocale(state.config), config: state.config };
}

const ConnectedTranslatedApp = connect(mapDispatchToProps)(TranslatedApp);

function bootstrap(opts: { config: CmsConfig }) {
  const { config } = opts;

  /**
   * Log the version number.
   */
  // if (typeof NETLIFY_CMS_CORE_VERSION === 'string') {
  //   console.log(`netlify-cms-core ${NETLIFY_CMS_CORE_VERSION}`);
  // }

  /**
   * Get DOM element where app will mount.
   */
  function getRoot() {
    /**
     * Return existing root if found.
     */
    const existingRoot = document.getElementById(ROOT_ID);
    if (existingRoot) {
      return existingRoot;
    }

    /**
     * If no existing root, create and return a new root.
     */
    const newRoot = document.createElement('div');
    newRoot.id = ROOT_ID;
    document.body.appendChild(newRoot);
    return newRoot;
  }

  store.dispatch(
    loadConfig(config, function onLoad() {
      store.dispatch(authenticateUser());
    }),
  );

  /**
   * Create connected root component.
   */
  function Root() {
    return (
      <>
        <Provider store={store}>
          <ConnectedTranslatedApp />
        </Provider>
      </>
    );
  }

  /**
   * Render application root.
   */
  const root = createRoot(getRoot());
  root.render(<Root />);
}

export default bootstrap;
