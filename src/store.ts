import SubX from 'subx';
import * as graph from '@microsoft/microsoft-graph-client';
import {message} from 'antd';
import RingCentral from '@rc-ex/core';
import localforage from 'localforage';
import AuthorizeUriExtension from '@rc-ex/authorize-uri';
import URI from 'urijs';
import axios from 'axios';

import {redirectUri, rcmMeetingRegex} from './utils';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
});
const authorizeUriExtension = new AuthorizeUriExtension();
rc.installExtension(authorizeUriExtension);

let client: graph.Client;

let googleCredentials: {
  adminEmail: string;
  clientEmail: string;
  privateKey: string;
};

export type StoreType = {
  currentStep: number;
  done: boolean;
  loginMicrosoft: Function;
  loginGoogle: Function;
  loginRingCentral: Function;
  migrate: Function;
  outlookMigrate: Function;
  googleMigrate: Function;
  restart: Function;
};
const store = SubX.proxy<StoreType>({
  currentStep: 0,
  done: false,
  async loginMicrosoft() {
    const authorizeUri = URI('https://login.microsoftonline.com')
      .directory('/common/adminconsent')
      .search({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        redirect_uri: redirectUri + 'microsoft.html',
      })
      .toString();
    window.open(authorizeUri, 'Login Microsoft', 'width=800,height=600');
    window.addEventListener('message', async e => {
      if (e.data.message === 'msAuthorizeFailure') {
        let errorMessage =
          'Authorization to access Office 365 account failed, please make sure you have admin permission!';
        if (e.data.error) {
          errorMessage = `${e.data.error}: ${e.data.errorDescription}`;
        }
        message.error(errorMessage, 300);
        return;
      } else if (e.data.message === 'msAuthorizeSuccess') {
        client = graph.Client.init({
          authProvider: done => {
            done(null, e.data.accessToken);
          },
        });
        window.focus();
        message.success('Authorization to Outlook Calendar is done', 5);
        this.currentStep = 1;
      }
    });
  },
  async loginGoogle() {
    window.open(
      redirectUri + 'google.html',
      'Login Google',
      'width=800,height=600'
    );
    window.addEventListener('message', async e => {
      if (e.data.message === 'googleAuthorizeSuccess') {
        const {adminEmail, clientEmail, privateKey} = e.data;
        googleCredentials = {adminEmail, clientEmail, privateKey};
        window.focus();
        message.success('Authorization to Google Calendar is done', 5);
        this.currentStep = 1;
      }
    });
  },
  async loginRingCentral() {
    const authorizeUri = authorizeUriExtension.buildUri({
      redirect_uri: redirectUri + 'ringcentral.html',
      code_challenge_method: 'S256',
    });
    const codeVerifier = authorizeUriExtension.codeVerifier;
    await localforage.setItem('code_verifier', codeVerifier);
    window.open(authorizeUri, 'Login RingCentral', 'width=800,height=600');
    window.addEventListener('message', async e => {
      if (e.data.message === 'rcAuthorizeSuccess') {
        rc.token = {access_token: e.data.accessToken};
        window.focus();
        message.success('Authorization to RingCentral is done', 5);
        this.currentStep = 2;
      }
    });
  },
  async migrate() {
    if (client && !googleCredentials) {
      // outlook migrate
      await this.outlookMigrate();
    }
    if (!client && googleCredentials) {
      // google migrate
      await this.googleMigrate();
    }
  },
  async outlookMigrate() {
    let r = await client.api('/users').get();
    console.log(r);
    for (const user of r.value) {
      r = await client
        .api(`/users/${user.userPrincipalName}/calendar/events`)
        .get();
      console.log(r);
      const events = r.value.filter(
        (e: {isOrganizer: boolean}) => e.isOrganizer
      );
      for (const event of events) {
        let match = event.bodyPreview.match(rcmMeetingRegex);
        if (match === null) {
          match = event.location.displayName.match(rcmMeetingRegex);
          if (match === null) {
            continue;
          }
        }
        const rcmUri = match[0];
        const meeting = (
          await rc.post('/rcvideo/v1/bridges', {
            expiresIn: 3600 * 24 * 365,
            type: 0,
          })
        ).data;
        await client
          .api(`/users/${user.userPrincipalName}/calendar/events/${event.id}`)
          .patch({
            body: {
              content: event.bodyPreview.replace(rcmUri, meeting.joinUri),
              contentType: 'text',
            },
            location: {
              displayName: event.location.displayName.replace(
                rcmUri,
                meeting.joinUri
              ),
              locationType: 'default',
            },
          });
      }
    }
    message.success('Congratulations, migration is done.', 5);
    this.done = true;
  },
  async googleMigrate() {
    const r1 = await axios.post(
      process.env.EXPRESS_PROXY_URI + 'google/admin/users/list',
      {
        auth: {
          ...googleCredentials,
          subjectEmail: googleCredentials.adminEmail,
        },
        body: {
          customer: 'my_customer',
        },
      }
    );
    console.log(JSON.stringify(r1.data, null, 2));

    for (const user of r1.data.users ?? []) {
      const r2 = await axios.post(
        process.env.EXPRESS_PROXY_URI + 'google/calendar/events/list',
        {
          auth: {
            ...googleCredentials,
            subjectEmail: user.primaryEmail,
          },
          body: {
            calendarId: 'primary',
          },
        }
      );
      console.log(JSON.stringify(r2.data, null, 2));
      const events = r2.data.items?.filter(
        (item: any) => item.organizer?.self === true
      );
      for (const event of events ?? []) {
        let match = event.location?.match(rcmMeetingRegex);
        if (match === null) {
          match = event.description?.match(rcmMeetingRegex);
        }
        if (match !== null) {
          console.log('Found a match:', JSON.stringify(event, null, 2));
          const r3 = await axios.post(
            process.env.EXPRESS_PROXY_URI + 'google/calendar/events/patch',
            {
              auth: {
                ...googleCredentials,
                subjectEmail: user.primaryEmail,
              },
              body: {
                calendarId: 'primary',
                eventId: event.id!,
                requestBody: {
                  location: event.location + ' 8',
                  description: event.description + ' 8',
                },
              },
            }
          );
          console.log(JSON.stringify(r3.data, null, 2));
        }
      }
    }
    message.success('Congratulations, migration is done.', 5);
    this.done = true;
  },
  restart() {
    this.currentStep = 0;
    this.done = false;
  },
});

export default store;
