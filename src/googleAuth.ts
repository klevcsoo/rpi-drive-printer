import { readFile, readFileSync, writeFileSync } from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { CRED_PATH, SCOPES, TOKEN_PATH } from './constants';

export async function authorizeGoogleAPIs() {
  const credentials = JSON.parse(readFileSync(CRED_PATH).toString('utf-8'));

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[ 0 ]);

  // Check if we have previously stored a token.
  return new Promise<OAuth2Client>((resolve) => {
    readFile(TOKEN_PATH, (err, token) => {
      if (err) { resolve(getAccessToken(oAuth2Client)); return; }
      oAuth2Client.setCredentials(JSON.parse(token.toString('utf-8')));
      resolve(oAuth2Client);
    });
  });
}

async function getAccessToken(oAuth2Client: OAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<OAuth2Client>((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err || !token) {
          reject(`Error retrieving access token: ${ err }`);
          return;
        }
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        writeFileSync(TOKEN_PATH, JSON.stringify(token));
        resolve(oAuth2Client);
      });
    });
  });
}

