import { execSync } from "child_process";
import { PathLike } from "fs";
import isProdBuild, { REMOTE_DEV_TEMP_DIR } from "../constants";

export async function addDocumentToPrintQueue(filePath: PathLike) {
  return new Promise<void>((resolve, reject) => {
    if (!isProdBuild) {
      try {
        const rsyncCmd = `rsync -q -r ${ filePath } rpi4:${ REMOTE_DEV_TEMP_DIR }/`;
        const rsyncRes = execSync(rsyncCmd).toString();
        if (!!rsyncRes) {
          console.log(`Printer server (rsync): ${ rsyncRes }`);
        }

        const fpa = filePath.toString().split('/'); // file path array
        const remoteFilePath = `${ REMOTE_DEV_TEMP_DIR }/${ fpa[ fpa.length - 1 ] }`;

        const sshRes = execSync(`ssh rpi4 "lp ${ remoteFilePath }"`).toString();
        if (!!sshRes) {
          console.log(`Printer server (ssh): ${ sshRes.trim() }`);
        }

        resolve();
      } catch (err) {
        reject(err);
      }
    } else {
      try {
        const lpRes = execSync(`lp ${ filePath }`).toString();
        if (!!lpRes) {
          console.log(`Printer server (lp): ${ lpRes }`);
        }

        resolve();
      } catch (err) {
        reject(err);
      }
    }
  });
}
