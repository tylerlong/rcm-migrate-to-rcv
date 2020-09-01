import SubX from 'subx';
import * as MSAL from 'msal';
import * as graph from '@microsoft/microsoft-graph-client';
import {message} from 'antd';
import RingCentral from '@rc-ex/core';
import localforage from 'localforage';
import AuthorizeUriExtension from '@rc-ex/authorize-uri';
import {TokenInfo} from '@rc-ex/core/lib/definitions';

const redirectUri = window.location.origin + window.location.pathname;
const urlSearchParams = new URLSearchParams(
  new URL(window.location.href).search
);
const code = urlSearchParams.get('code');
const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
});

const authorizeUriExtension = new AuthorizeUriExtension();
rc.installExtension(authorizeUriExtension);
const authorizeUri = authorizeUriExtension.buildUri({
  redirect_uri: redirectUri,
  code_challenge_method: 'S256',
});
const codeVerifier = authorizeUriExtension.codeVerifier;
localforage.setItem('code_verifier', codeVerifier);

let client: graph.Client;

const userAgentApplication = new MSAL.UserAgentApplication({
  auth: {
    clientId: process.env.MSAL_CLIENT_ID!,
    authority: process.env.MSAL_AUTHORITY!,
    redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
});

const authenticationParams = {
  scopes: ['Calendars.ReadWrite'],
};

export type StoreType = {
  isMainWindow: boolean;
  loginMicrosoft: Function;
  loginRingCentral: Function;
  migrate: Function;
};
const store = SubX.proxy<StoreType>({
  isMainWindow: true,
  async loginMicrosoft() {
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
  async loginRingCentral() {
    window.open(authorizeUri, 'Login RingCentral', 'width=800,height=600');
  },
  async migrate() {
    const events = await client.api('/me/calendar/events').get();
    console.log(events);
    const extInfo = await rc.restapi().account().extension().get();
    console.log(extInfo);
    message.success(
      'Congratulations, migration is done, please check your Outlook Calendar.',
      5
    );
  },
});

if (code !== null) {
  // this is the popup window
  store.isMainWindow = false;
  (async () => {
    await rc.authorize({
      code,
      redirect_uri: redirectUri,
      code_verifier: (await localforage.getItem('code_verifier')) as string,
    });
    await localforage.setItem('token', rc.token);
    (window.opener as Window).postMessage(
      'rcLoginSuccess',
      window.location.origin
    );
    window.close();
  })();
} else {
  // this is the main window
  store.isMainWindow = true;
  window.addEventListener(
    'message',
    async e => {
      if (e.data === 'rcLoginSuccess') {
        rc.token = (await localforage.getItem<TokenInfo>('token'))!;
        window.focus();
        message.success('Step #2 is done, please continue to step #3.', 5);
      }
    },
    false
  );
}

export default store;
