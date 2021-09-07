import { authorizeGoogleAPIs } from './googleAuth';
import { onPrintDirContentChange } from './lib/watcher';
import { existsSync, mkdirSync } from 'fs';
import { TEMP_DOWNLOAD_DIR } from './constants';
import { deleteDriveFile, downloadDriveFile } from './lib/drive';
import { addDocumentToPrintQueue } from './lib/printer';

if (!existsSync(TEMP_DOWNLOAD_DIR)) {
  mkdirSync(TEMP_DOWNLOAD_DIR);
}

authorizeGoogleAPIs().then((auth) => {
  console.log(`Listening to changes. Client ID is ${ auth._clientId }.`);
  console.log('------------------------------');

  onPrintDirContentChange(auth, async (drive, files) => {
    for (const id of files) {
      const filePath = await downloadDriveFile(drive, id);
      console.log(`Downloaded to ${ filePath }`);
      addDocumentToPrintQueue(filePath).then(() => {
        console.log('Printing document...');
        deleteDriveFile(drive, id).then(() => {
          console.log(`Deleted file from Drive with ID ${ id }`);
          console.log('------------------------------');
        }).catch((err) => console.error(err));
      }).catch((err) => console.error(err));
    }
  });
}).catch((err) => {
  console.error(err);
});

process.addListener('SIGINT', () => {
  console.log('\nRecieved Ctrl+C, stopping...');
  process.exit();
});
