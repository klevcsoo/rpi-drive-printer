import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const DRIVE_PRINT_DIR_ID = '1yX7U0cUoT-UntZwtP8hkRJ5QZFkPdKWs';
const CONTENT_CHECK_INTERVAL = 8000; //ms

export function onPrintDirContentChange(
  auth: OAuth2Client, callback: (files: string[]) => void
) {
  const drive = google.drive({ version: 'v3', auth: auth });

  let oldContent: string[] = [];
  let i = 0;

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

      if (i !== 0 && !!difference.length) {
        console.log(`[${ new Date().toLocaleString() }] New files uploaded:`, difference);
        callback(difference);
      }

      i++;
    });
  }, CONTENT_CHECK_INTERVAL);
}
