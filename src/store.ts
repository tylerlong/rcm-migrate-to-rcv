import SubX from 'subx';
import * as graph from '@microsoft/microsoft-graph-client';
import {message} from 'antd';
import RingCentral from '@rc-ex/core';
import localforage from 'localforage';
import AuthorizeUriExtension from '@rc-ex/authorize-uri';
import URI from 'urijs';

const redirectUri = window.location.origin + window.location.pathname;
const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
});

const authorizeUriExtension = new AuthorizeUriExtension();
rc.installExtension(authorizeUriExtension);

let client: graph.Client;

export type StoreType = {
  loginMicrosoft: Function;
  loginRingCentral: Function;
  migrate: Function;
};
const store = SubX.proxy<StoreType>({
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
        message.error(
          'Authorization to access Office 365 account failed, please make sure you have admin permission!'
        );
        return;
      } else if (e.data.message === 'msAuthorizeSuccess') {
        client = graph.Client.init({
          authProvider: done => {
            done(null, e.data.accessToken);
          },
        });
        window.focus();
        message.success('Step #1 is done, please continue to step #2.', 5);
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
        message.success('Step #2 is done, please continue to step #3.', 5);
      }
    });
  },
  async migrate() {
    const defaultMeeting = (
      await rc.get('/rcvideo/v1/bridges', {default: true})
    ).data;

    let r = await client.api('/users').get();
    for (const user of r.value) {
      r = await client
        .api(`/users/${user.userPrincipalName}/calendar/events`)
        .get();
      console.log(r);
      const events = r.value.filter(
        (e: {isOrganizer: boolean}) => e.isOrganizer
      );
      for (const event of events) {
        let match = event.bodyPreview.match(
          /https:\/\/meetings\.ringcentral\.com\/j\/\d+/
        );
        if (match === null) {
          match = event.location.displayName.match(
            /https:\/\/meetings\.ringcentral\.com\/j\/\d+/
          );
          if (match === null) {
            continue;
          }
        }
        const rcmUri = match[0];
        await client
          .api(`/users/${user.userPrincipalName}/calendar/events/${event.id}`)
          .patch({
            body: {
              content: event.bodyPreview.replace(
                rcmUri,
                defaultMeeting.joinUri
              ),
              contentType: 'text',
            },
            location: {
              displayName: event.location.displayName.replace(
                rcmUri,
                defaultMeeting.joinUri
              ),
              locationType: 'default',
            },
          });
      }
    }
    message.success(
      'Congratulations, migration is done, please check Outlook calendars.',
      5
    );
  },
});

export default store;
