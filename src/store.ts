import SubX from 'subx';
import * as MSAL from 'msal';
import * as graph from '@microsoft/microsoft-graph-client';

export type StoreType = {
  ready: boolean;
  init: Function;
  load: Function;
  login: Function;
  migrate: Function;
};

let client: graph.Client;

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
    await userAgentApplication.loginPopup({
      scopes: ['Calendars.ReadWrite'],
    });
    const tokenResponse = await userAgentApplication.acquireTokenSilent({
      scopes: ['Calendars.ReadWrite'],
    });
    client = graph.Client.init({
      authProvider: done => {
        done(null, tokenResponse.accessToken);
      },
    });
  },
  async migrate() {
    const events = await client.api('/me/calendar/events').get();
    console.log(events);
  },
});

export default store;
