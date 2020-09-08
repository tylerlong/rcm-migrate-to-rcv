import {google} from 'googleapis';

export const redirectUri = window.location.origin + window.location.pathname;

export const rcmMeetingRegex = /https:\/\/meetings\.ringcentral\.com\/j\/\d+/;

type CredentialBody = {
  client_email: string;
  private_key: string;
};

export const getGoogleAuth = (
  credentials: CredentialBody,
  subjectEmail: string
) => {
  return new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/admin.directory.user',
      'https://www.googleapis.com/auth/calendar',
    ],
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    clientOptions: {subject: subjectEmail},
  });
};
