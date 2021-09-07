import { join as joinPath } from 'path';

const isProdBuild = process.env.NODE_ENV === 'production';
export default isProdBuild;

export const TEMP_DOWNLOAD_DIR = joinPath(__dirname, '../temp');
export const REMOTE_DEV_TEMP_DIR = joinPath('~/rpidp-dev-temp');
export const TOKEN_PATH = joinPath(__dirname, '../google_api_token.json');
export const CRED_PATH = joinPath(__dirname, '../google_api_credentials.json');
export const SCOPES = [ 'https://www.googleapis.com/auth/drive' ];
export const DRIVE_PRINT_DIR_ID = '1yX7U0cUoT-UntZwtP8hkRJ5QZFkPdKWs';
export const CONTENT_CHECK_INTERVAL = process.env.NODE_ENV === 'production' ? 8000 : 2000;
