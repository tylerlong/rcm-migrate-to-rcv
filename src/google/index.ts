import {google} from 'googleapis';
import path from 'path';

const scopes = [
  'https://www.googleapis.com/auth/admin.directory.user',
  'https://www.googleapis.com/auth/calendar',
];

const getGoogleAuth = (subject = 'tylerliu@chuntaoliu.com') => {
  return new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes,
    clientOptions: {subject},
  });
};

(async () => {
  const r1 = await google
    .admin({
      version: 'directory_v1',
      auth: getGoogleAuth('tylerliu@chuntaoliu.com'),
    })
    .users.list({domain: 'chuntaoliu.com'});
  console.log(JSON.stringify(r1.data, null, 2));

  for (const user of r1.data.users ?? []) {
    const r2 = await google
      .calendar({
        version: 'v3',
        auth: getGoogleAuth(user.primaryEmail!),
      })
      .calendarList.list();
    console.log(JSON.stringify(r2.data, null, 2));
  }
})();
