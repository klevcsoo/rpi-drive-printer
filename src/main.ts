import { authorizeGoogleAPIs } from './googleAuth';
import { onPrintDirContentChange } from './lib/watcher';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join as joinPath } from 'path';
import { TEMP_DOWNLOAD_DIR } from './constants';

if (!existsSync(TEMP_DOWNLOAD_DIR)) {
  mkdirSync(TEMP_DOWNLOAD_DIR);
}

authorizeGoogleAPIs().then((auth) => {
  console.log(`Listening to changes. Client ID is ${ auth._clientId }.`);

  onPrintDirContentChange(auth, (drive, files) => {
    for (const id of files) {
      drive.files.get({
        fileId: id,
        alt: 'media'
      }, { responseType: 'blob' }, (err, response) => {
        if (!!err || !response) { console.error(err); return; }

        const file = (response.data as any) as Blob;
        const ext = file.type.split('/')[ 1 ];
        const filePath = joinPath(TEMP_DOWNLOAD_DIR, `${ id }.${ ext }`);

        file.arrayBuffer().then((ab) => {
          writeFileSync(filePath, Buffer.from(ab));
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
