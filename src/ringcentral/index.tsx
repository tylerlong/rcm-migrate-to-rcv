import '../index.css';

import ReactDOM from 'react-dom';
import React from 'react';
import {Spin} from 'antd';
import RingCentral from '@rc-ex/core';
import localforage from 'localforage';

const urlSearchParams = new URLSearchParams(
  new URL(window.location.href).search
);
const code = urlSearchParams.get('code')!;
const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
});

(async () => {
  await rc.authorize({
    code,
    redirect_uri: window.location.origin + window.location.pathname,
    code_verifier: (await localforage.getItem('code_verifier')) as string,
  });
  (window.opener as Window).postMessage(
    {message: 'rcAuthorizeSuccess', accessToken: rc.token!.access_token},
    window.location.origin
  );
  window.close();
})();

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<Spin size="large" />, container);
