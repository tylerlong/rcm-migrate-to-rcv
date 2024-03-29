import '../index.css';

import axios from 'axios';
import qs from 'qs';
import ReactDOM from 'react-dom';
import React from 'react';
import {Spin} from 'antd';

const urlSearchParams = new URLSearchParams(
  new URL(window.location.href).search
);
const adminConsent = urlSearchParams.get('admin_consent');
const error = urlSearchParams.get('error');
const errorDescription = urlSearchParams.get('error_description');
if (adminConsent !== 'True' || error !== null) {
  (window.opener as Window).postMessage(
    {message: 'msAuthorizeFailure', error, errorDescription},
    window.location.origin
  );
  window.close();
}

const tenant = urlSearchParams.get('tenant');
(async () => {
  const r = await axios.post(
    `${process.env.EXPRESS_PROXY_URI}microsoft/${tenant}/oauth2/v2.0/token`,
    qs.stringify({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      grant_type: 'client_credentials',
      scope: 'https://graph.microsoft.com/.default',
    })
  );
  (window.opener as Window).postMessage(
    {message: 'msAuthorizeSuccess', accessToken: r.data.access_token},
    window.location.origin
  );
  window.close();
})();

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<Spin size="large" />, container);
