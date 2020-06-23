import Navbar from './components/navbar';
import ScrollToTop from './utils/ScrollToTop';

import React, {Suspense, lazy} from 'react';
import {Helmet} from 'react-helmet';
import {useTranslation} from 'react-i18next';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import {useLocalStorage, useEffectOnce} from 'react-use';
import './App.scss';

const Home = lazy(() =>
  import('./components/home' /* webpackChunkName: "Home" */)
);
const DeepDive = lazy(() =>
  import('./components/deepdive' /* webpackChunkName: "DeepDive" */)
);
const FAQ = lazy(() =>
  import('./components/faq' /* webpackChunkName: "FAQ" */)
);
const Demographics = lazy(() =>
  import('./components/demographics' /* webpackChunkName: "PatientDB" */)
);
const State = lazy(() =>
  import('./components/state' /* webpackChunkName: "State" */)
);
const Essentials = lazy(() =>
  import('./components/essentials' /* webpackChunkName: "Essentials" */)
);

const schemaMarkup = {
  '@context': 'http://schema.org/',
  '@type': 'NGO',
  name: 'Coronavirus Outbreak in India: Latest Map and Job loss count',
  alternateName: 'Job Loss Tracker',
  url: '*',
  image: '*',
};

function App() {
  const {t} = useTranslation();

  const pages = [
    {
      pageLink: '',
      view: Home,
      displayName: 'Home',
      animationDelayForNavbar: 0.2,
      showInNavbar: true,
    }
  ];

  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [isThemeSet] = useLocalStorage('isThemeSet', false);

  useEffectOnce(() => {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches &&
      !isThemeSet
    ) {
      setDarkMode(true);
    } else if (
      window.matchMedia &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches &&
      !isThemeSet
    ) {
      setDarkMode(false);
    }
  });

  React.useEffect(() => {
    if (darkMode) {
      document.querySelector('body').classList.add('dark-mode');
    } else {
      document.querySelector('body').classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className="App">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      <Router>
        <ScrollToTop />
        <Suspense fallback={<div className="lazy"></div>}>
          <Route
            render={({location}) => (
              <React.Fragment>
                
                <Switch location={location}>
                  {pages.map((page, index) => {
                    return (
                      <Route
                        exact
                        path={page.pageLink}
                        render={({match}) => (
                          <page.view key={match.params.stateCode || index} />
                        )}
                        key={index}
                      />
                    );
                  })}
                  <Redirect to="/" />
                </Switch>
              </React.Fragment>
            )}
          />
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
