import { authorizeGoogleAPIs } from './googleAuth';
import { onPrintDirContentChange } from './watcher';
import { google } from 'googleapis';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join as joinPath } from 'path';

const TEMP_DOWNLOAD_DIR = joinPath(__dirname, '../temp');

if (!existsSync(TEMP_DOWNLOAD_DIR)) {
  mkdirSync(TEMP_DOWNLOAD_DIR);
}

authorizeGoogleAPIs().then((auth) => {
  console.log(`Listening to changes. Client ID is ${ auth._clientId }.`);

  const drive = google.drive({ version: 'v3', auth: auth });
  onPrintDirContentChange(auth, (files) => {
    for (const id of files) {
      drive.files.get({
        fileId: id,
        alt: 'media'
      }, { responseType: 'blob' }, (err, response) => {
        if (!!err || !response) { console.error(err); return; }

        const file = (response.data as any) as Blob;
        const ext = file.type.split('/')[ 1 ];

        file.arrayBuffer().then((ab) => {
          writeFileSync(joinPath(TEMP_DOWNLOAD_DIR, `${ id }.${ ext }`), Buffer.from(ab));
        });
      });
    }
  });
}).catch((err) => {
  console.error(err);
});

process.addListener('SIGINT', () => {
  console.log('\nRecieved Ctrl+C, stopping...');
  process.exit();
});
