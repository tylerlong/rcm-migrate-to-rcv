import {google} from 'googleapis';
import path from 'path';
import fs from 'fs';

const scopes = [
  'https://www.googleapis.com/auth/admin.directory.user',
  'https://www.googleapis.com/auth/calendar',
];

const rcmMeetingRegex = /https:\/\/meetings\.ringcentral\.com\/j\/\d+/;

const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'service-account.json'), 'utf8')
);

const getGoogleAuth = (subject = 'tylerliu@chuntaoliu.com') => {
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
      auth: getGoogleAuth('tylerliu@chuntaoliu.com'),
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
    const r2 = await calendar.events.list({calendarId: 'primary'});
    console.log(JSON.stringify(r2.data, null, 2));
    const events = r2.data.items?.filter(i => i.organizer?.self === true);
    for (const event of events ?? []) {
      let match = event.location?.match(rcmMeetingRegex);
      if (match === null) {
        match = event.description?.match(rcmMeetingRegex);
      }
      if (match !== null) {
        console.log('Found a match:', JSON.stringify(event, null, 2));
        // todo: update this event
      }
    }
  }
})();
