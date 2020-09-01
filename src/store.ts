import SubX from 'subx';
import * as MSAL from 'msal';
import * as graph from '@microsoft/microsoft-graph-client';
import {message} from 'antd';

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

const authenticationParams = {
  scopes: ['Calendars.ReadWrite'],
};

const store = SubX.proxy<StoreType>({
  ready: false,
  init() {},
  load() {},
  async login() {
    await userAgentApplication.loginPopup(authenticationParams);
    const tokenResponse = await userAgentApplication.acquireTokenSilent(
      authenticationParams
    );
    client = graph.Client.init({
      authProvider: done => {
        done(null, tokenResponse.accessToken);
      },
    });
    message.success('Step #1 is done, please continue to step #2.', 5);
  },
  async migrate() {
    const events = await client.api('/me/calendar/events').get();
    console.log(events);
    message.success(
      'Congratulations, migration is done, please check your Outlook Calendar.',
      5
    );
  },
});

export default store;
