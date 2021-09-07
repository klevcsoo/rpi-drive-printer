import { authorizeGoogleAPIs } from './googleAuth';
import { onPrintDirContentChange } from './lib/watcher';
import { existsSync, mkdirSync } from 'fs';
import { TEMP_DOWNLOAD_DIR } from './constants';
import { downloadDriveFile } from './lib/downloader';

if (!existsSync(TEMP_DOWNLOAD_DIR)) {
  mkdirSync(TEMP_DOWNLOAD_DIR);
}

authorizeGoogleAPIs().then((auth) => {
  console.log(`Listening to changes. Client ID is ${ auth._clientId }.`);

  onPrintDirContentChange(auth, async (drive, files) => {
    for (const id of files) {
      const filePath = await downloadDriveFile(drive, id);
      console.log(filePath);
    }
  });
}).catch((err) => {
  console.error(err);
});

process.addListener('SIGINT', () => {
  console.log('\nRecieved Ctrl+C, stopping...');
  process.exit();
});
