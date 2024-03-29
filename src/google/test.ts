// eslint-disable-next-line node/no-unpublished-import
import {google} from 'googleapis';
import path from 'path';
import fs from 'fs';

const googleAdminEmail = 'tylerliu@chuntaoliu.com';

const scopes = [
  'https://www.googleapis.com/auth/admin.directory.user',
  'https://www.googleapis.com/auth/calendar',
];

const rcmMeetingRegex = /https:\/\/meetings\.ringcentral\.com\/j\/\d+/;

const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'service-account.json'), 'utf8')
);

const getGoogleAuth = (subject = googleAdminEmail) => {
  return new google.auth.GoogleAuth({
    scopes,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    clientOptions: {subject},
  });
};

(async () => {
  const r1 = await google
    .admin({
      version: 'directory_v1',
      auth: getGoogleAuth(googleAdminEmail),
    })
    .users.list({
      customer: 'my_customer',
    });
  console.log(JSON.stringify(r1.data, null, 2));

  for (const user of r1.data.users ?? []) {
    const calendar = google.calendar({
      version: 'v3',
      auth: getGoogleAuth(user.primaryEmail!),
    });
    let r2: any;
    try {
      r2 = await calendar.events.list({calendarId: 'primary'});
    } catch (e) {
      console.log(JSON.stringify(e.response.data, null, 2));
      console.log(e.response.status);
      return;
    }
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
        // todo: update this event
        const r3 = await calendar.events.patch({
          calendarId: 'primary',
          eventId: event.id!,
          requestBody: {
            location: event.location + ' 6',
            description: event.description + ' 6',
          },
        });
        console.log('before');
        console.log(JSON.stringify(r3.data, null, 2));
        console.log('after');
      }
    }
  }
})();
