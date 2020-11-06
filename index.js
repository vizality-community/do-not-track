/* eslint-disable no-undef */
const { getModule } = require('@vizality/webpack');
const { Plugin } = require('@vizality/entities');

let Analytics, Reporter, Sentry;

module.exports = class DoNotTrack extends Plugin {
  onStart () {
    Analytics = getModule('getSuperPropertiesBase64');
    Reporter = getModule('submitLiveCrashReport');
    Sentry = {
      main: window.__SENTRY__.hub,
      client: window.__SENTRY__.hub.getClient()
    };

    Analytics.__oldTrack = Analytics.track;
    Analytics.track = () => void 0;

    Reporter.__oldSubmitLiveCrashReport = Reporter.submitLiveCrashReport;
    Reporter.submitLiveCrashReport = () => void 0;

    Sentry.client.close();
    Sentry.main.getScope().clear();
    Sentry.main.__oldAddBreadcrumb = Sentry.main.addBreadcrumb;
    Sentry.main.addBreadcrumb = () => void 0;

    window.__oldConsole = window.console;

    Object.assign(window.console, [ 'debug', 'info', 'warn', 'error', 'log', 'assert' ].forEach(
      (method) => {
        if (window.console[method].__sentry_original__) {
          window.console[method] = window.console[method].__sentry_original__;
        } else if (window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__) {
          window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__ = window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__.__sentry_original__;
        }
      })
    );
  }

  onStop () {
    Analytics.track = Analytics.__oldTrack;
    Reporter.submitLiveCrashReport = Reporter.__oldSubmitLiveCrashReport;
    Sentry.main.addBreadcrumb = Sentry.main.__oldAddBreadcrumb;
    Sentry.client.getOptions().enabled = true;
    window.console = window.__oldConsole;
  }
};
