import { drive_v3, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import isProdBuild, { CONTENT_CHECK_INTERVAL, DRIVE_PRINT_DIR_ID } from '../constants';

export function onPrintDirContentChange(
  auth: OAuth2Client, callback: (drive: drive_v3.Drive, files: string[]) => void
) {
  const drive = google.drive({ version: 'v3', auth: auth });

  let oldContent: string[] = [];
  let isFirstCheck = true;

  setInterval(() => {
    drive.files.list({
      q: `'${ DRIVE_PRINT_DIR_ID }' in parents and trashed=false`,
      spaces: 'drive',
      pageSize: 10,
      fields: 'nextPageToken, files(id)'
    }, (err, response) => {
      if (err || !response) throw new Error(`API (getting files): ${ err }`);

      const newContent = response.data.files!.map(({ id }) => id!);
      const difference = newContent.filter((file) => !oldContent.includes(file));
      oldContent = [ ...newContent ];

      if ((isProdBuild ? !isFirstCheck : true) && !!difference.length) {
        console.log(`[${ new Date().toLocaleString() }] New files uploaded:`, difference);
        callback(drive, difference);
      }

      process.stdout.write(`Last was at ${ new Date().toLocaleString() }\r`);
      isFirstCheck = false;
    });
  }, CONTENT_CHECK_INTERVAL);
}
