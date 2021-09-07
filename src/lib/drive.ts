import { PathLike, writeFileSync } from "fs";
import { drive_v3 } from "googleapis";
import { join as joinPath } from 'path';
import { TEMP_DOWNLOAD_DIR } from "../constants";

export async function downloadDriveFile(drive: drive_v3.Drive, fileId: string) {
  return new Promise<PathLike>((resolve, reject) => {
    drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, { responseType: 'blob' }, (err, response) => {
      if (!!err || !response) { reject(err); return; }

      const file = (response.data as any) as Blob;
      const ext = file.type.split('/')[ 1 ];
      const filePath = joinPath(TEMP_DOWNLOAD_DIR, `${ fileId }.${ ext }`);

      file.arrayBuffer().then((ab) => {
        writeFileSync(filePath, Buffer.from(ab));
        resolve(filePath);
      });
    });
  });
}

export async function deleteDriveFile(drive: drive_v3.Drive, fileId: string) {
  return new Promise<void>((resolve, reject) => {
    drive.files.delete({
      fileId: fileId
    }, (err, response) => {
      if (!!err || !response) { reject(err); return; }
      resolve();
    });
  });
}
