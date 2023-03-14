import { google } from 'googleapis';
import env from './config';
import { authenticate } from './authenticate';

const searchconsole = google.searchconsole('v1');

const creds = {
  client_id: env.CLIENT_ID,
  client_secret: env.CLIENT_SECRET,
  project_id: 'linen-dev',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  redirect_uris: ['http://localhost:3000/oauth2callback'],
};

export const oauth2Client = new google.auth.OAuth2(
  creds.client_id,
  creds.client_secret,
  creds.redirect_uris[0]
);

google.options({ auth: oauth2Client });

const scopes = [
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/webmasters.readonly',
];

authenticate(scopes)
  .then(() => runSample())
  .catch(console.error);

async function runSample() {
  // const result = await searchconsole.sites.list();
  // console.log('o%', result.data);

  const result = await searchconsole.searchanalytics.query({
    requestBody: {
      // dimensions: ['date'],
      dimensions: ['page'], // top pages
      startDate: '2022-12-14',
      endDate: '2023-03-14',
    },
    siteUrl: 'sc-domain:linen.dev',
  });
  console.log('%j', result.data.rows);
}
