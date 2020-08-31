import SubX from 'subx';
import * as MSAL from 'msal';

export type StoreType = {
  ready: boolean;
  init: Function;
  load: Function;
  login: Function;
};

const userAgentApplication = new MSAL.UserAgentApplication({
  auth: {
    clientId: process.env.MSAL_CLIENT_ID!,
    authority: 'https://login.microsoftonline.com/common/',
    redirectUri: window.location.origin + window.location.pathname,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
});

const store = SubX.proxy<StoreType>({
  ready: false,
  init() {},
  load() {},
  async login() {
    const loginResponse = await userAgentApplication.loginPopup({
      scopes: ['Calendars.ReadWrite'],
    });
    console.log(loginResponse);
    const tokenResponse = await userAgentApplication.acquireTokenSilent({
      scopes: ['Calendars.ReadWrite'],
    });
    console.log(tokenResponse);
  },
});

export default store;
