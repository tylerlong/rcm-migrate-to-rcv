import path from 'path';
import fs from 'fs';
import axios from 'axios';

import {rcmMeetingRegex} from '../utils';

const googleAdminEmail = 'tylerliu@chuntaoliu.com';

const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'service-account.json'), 'utf8')
);

(async () => {
  const r1 = await axios.post(
    process.env.EXPRESS_PROXY_URI + 'google/admin/users/list',
    {
      privateKey: credentials.private_key,
      clientEmail: credentials.client_email,
      subjectEmail: googleAdminEmail,
    }
  );
  console.log(JSON.stringify(r1.data, null, 2));

  for (const user of r1.data.users ?? []) {
    const r2 = await axios.post(
      process.env.EXPRESS_PROXY_URI + 'google/calendar/events/list',
      {
        privateKey: credentials.private_key,
        clientEmail: credentials.client_email,
        subjectEmail: user.primaryEmail,
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
        // todo: update this event
      }
    }
  }
})();
