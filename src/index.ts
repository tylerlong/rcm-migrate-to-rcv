import * as Msal from 'msal';

const msalConfig = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID!,
  },
};

const msalInstance = new Msal.UserAgentApplication(msalConfig);

console.log(process.env.MSAL_CLIENT_ID);
