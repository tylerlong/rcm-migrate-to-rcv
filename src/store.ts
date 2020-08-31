import SubX from 'subx';
import * as MSAL from 'msal';
import * as graph from '@microsoft/microsoft-graph-client';
// eslint-disable-next-line node/no-unpublished-import
import waitFor from 'wait-for-async';

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
    const client = graph.Client.init({
      authProvider: done => {
        done(null, tokenResponse.accessToken);
      },
    });

    await waitFor({interval: 3000});

    const events = await client.api('/me/calendar/events').get();
    console.log(events);
    // const r = await axios.get('/me/calendar/events', {
    //   headers: {
    //     Authorization: `Bearer ${tokenResponse.accessToken}`,
    //   },
    // });
    // console.log(r.data);
  },
});

export default store;
