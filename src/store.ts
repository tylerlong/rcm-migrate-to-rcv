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
  pendingText: string;
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
  pendingText: '',
  async loginMicrosoft() {
    this.pendingText = 'Login Microsoft';
    const authorizeUri = URI('https://login.microsoftonline.com')
      .directory('/common/adminconsent')
      .search({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        redirect_uri: redirectUri + 'microsoft.html',
      })
      .toString();
    const childWindow = window.open(
      authorizeUri,
      'Login Microsoft',
      'width=800,height=600'
    );
    const messageListener = async (e: MessageEvent) => {
      if (e.data.message === 'msAuthorizeFailure') {
        let errorMessage =
          'Authorization to access Office 365 account failed, please make sure you have admin permission!';
        if (e.data.error) {
          errorMessage = `${e.data.error}: ${e.data.errorDescription}`;
        }
        message.error(errorMessage, 300);
        this.pendingText = '';
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
        this.pendingText = '';
      }
    };
    const timer = setInterval(() => {
      if (childWindow?.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageListener);
        this.pendingText = '';
      }
    }, 500);
    window.addEventListener('message', messageListener);
  },
  async loginGoogle() {
    this.pendingText = 'Login Google';
    const childWindow = window.open(
      redirectUri + 'google.html',
      'Login Google',
      'width=800,height=600'
    );
    const messageListener = async (e: MessageEvent) => {
      if (e.data.message === 'googleAuthorizeSuccess') {
        const {adminEmail, clientEmail, privateKey} = e.data;
        googleCredentials = {adminEmail, clientEmail, privateKey};
        window.focus();
        message.success('Authorization to Google Calendar is done', 5);
        this.currentStep = 1;
        this.pendingText = '';
      }
    };
    const timer = setInterval(() => {
      if (childWindow?.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageListener);
        this.pendingText = '';
      }
    }, 500);
    window.addEventListener('message', messageListener);
  },
  async loginRingCentral() {
    this.pendingText = 'Login RingCentral';
    const authorizeUri = authorizeUriExtension.buildUri({
      redirect_uri: redirectUri + 'ringcentral.html',
      code_challenge_method: 'S256',
    });
    const codeVerifier = authorizeUriExtension.codeVerifier;
    await localforage.setItem('code_verifier', codeVerifier);
    const childWindow = window.open(
      authorizeUri,
      'Login RingCentral',
      'width=800,height=600'
    );
    const messageListener = async (e: MessageEvent) => {
      if (e.data.message === 'rcAuthorizeSuccess') {
        rc.token = {access_token: e.data.accessToken};
        window.focus();
        message.success('Authorization to RingCentral is done', 5);
        this.currentStep = 2;
        this.pendingText = '';
      }
    };
    const timer = setInterval(() => {
      if (childWindow?.closed) {
        clearInterval(timer);
        window.removeEventListener('message', messageListener);
        this.pendingText = '';
      }
    }, 500);
    window.addEventListener('message', messageListener);
  },
  async migrate() {
    this.pendingText = 'Migration in progress';
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
        this.pendingText = `Doing migration for Outlook user ${user.displayName}`;
        await client
          .api(`/users/${user.userPrincipalName}/calendar/events/${event.id}`)
          .patch({
            body: {
              content: event.bodyPreview.split(rcmUri).join(meeting.joinUri),
              contentType: 'text',
            },
            location: {
              displayName: event.location.displayName
                .split(rcmUri)
                .join(meeting.joinUri),
              locationType: 'default',
            },
          });
      }
    }
    message.success('Congratulations, migration is done.', 5);
    this.done = true;
    this.pendingText = '';
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
    if (r1.data.exception) {
      message.error(`${r1.data.status}: ${JSON.stringify(r1.data.data)}`, 300);
      this.pendingText = '';
      return;
    }

    for (const user of r1.data.data.users ?? []) {
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
      if (r2.data.exception) {
        message.error(
          `${r2.data.status}: ${JSON.stringify(r2.data.data)}`,
          300
        );
        this.pendingText = '';
        return;
      }
      const events = r2.data.data.items?.filter(
        (item: any) => item.organizer?.self === true
      );
      for (const event of events ?? []) {
        let match = event.location?.match(rcmMeetingRegex);
        if (match === null) {
          match = event.description?.match(rcmMeetingRegex);
        }
        if (match === null) {
          continue;
        }
        console.log('Found a match:', JSON.stringify(event, null, 2));
        const rcmUri = match[0];
        const meeting = (
          await rc.post('/rcvideo/v1/bridges', {
            expiresIn: 3600 * 24 * 365,
            type: 0,
          })
        ).data;
        this.pendingText = `Doing migration for Google user ${user.name.fullName}`;
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
                location: event.location.split(rcmUri).join(meeting.joinUri),
                description: event.description
                  .split(rcmUri)
                  .join(meeting.joinUri),
              },
            },
          }
        );
        console.log(JSON.stringify(r3.data, null, 2));
        if (r3.data.exception) {
          message.error(
            `${r3.data.status}: ${JSON.stringify(r3.data.data)}`,
            300
          );
          this.pendingText = '';
          return;
        }
      }
    }
    message.success('Congratulations, migration is done.', 5);
    this.done = true;
    this.pendingText = '';
  },
  restart() {
    this.currentStep = 0;
    this.done = false;
  },
});

export default store;
