import {google} from 'googleapis';
import path from 'path';

const scopes = ['https://www.googleapis.com/auth/calendar'];

const googleAuth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes,
  clientOptions: {
    // subject: 'peterlong@chuntaoliu.com',
    subject: 'tylerliu@chuntaoliu.com',
  },
});

const googleCalendar = google.calendar({
  version: 'v3',
  auth: googleAuth,
});

(async () => {
  const r = await googleCalendar.calendarList.list();
  console.log(JSON.stringify(r.data, null, 2));
})();
