import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';

import App from './main';
import store from './store';

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<App store={store} />, container);

(async () => {
  await store.init();
  await store.load();
  store.ready = true;
})();

// import * as Msal from 'msal';
// import waitFor from "wait-for-async";

// const msalConfig: Msal.Configuration = {
//   auth: {
//     clientId: process.env.MSAL_CLIENT_ID!,
//     authority: 'https://login.microsoftonline.com/common/',
//     redirectUri: window.location.origin + window.location.pathname,
//   },
//   cache: {
//     cacheLocation: "localStorage",
//   }
// };

// const loginRequest = {
//   scopes: ["Calendars.ReadWrite"]
// };

// // Add here scopes for access token to be used at MS Graph API endpoints.
// const tokenRequest = {
//   scopes: ["Calendars.ReadWrite"]
// };

// const userAgentApplication = new Msal.UserAgentApplication(msalConfig);

// (async () => {
//   await waitFor({interval: 5000});
//   // const loginResponse = await userAgentApplication.loginPopup(loginRequest)
//   // console.log(loginResponse);
// })();
