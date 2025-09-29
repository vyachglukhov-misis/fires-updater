import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { workingDirectories } from '../chores/directoriesManager.js';
import { logger } from '~/logger.js';

const getCmd = (inputFilesListDist: string, OUTPUT_FILE: string) =>
  `gdal_merge.py -ot UInt16 -of GTiff -o "${OUTPUT_FILE}" --optfile "${inputFilesListDist}" -co COMPRESS=DEFLATE`;

export const useGdalMerge = async () => {
  const now = new Date()
  const formattedNow = now.getFullYear().toString() +
  String(now.getMonth() + 1).padStart(2, "0") +
  String(now.getDate()).padStart(2, "0"); // YYYYMMDD

  const { OPT_OUTPUT_DIR, TILES_OUTPUT_DIR, MAIN_TIFF_OUTPUT_DIR } =
    workingDirectories;

  const OPT_OUTPUT_FILENAME = OPT_OUTPUT_DIR + `/${String(now.getTime())}.txt`;
  const MAIN_TIFF_OUTPUT_FILENAME = MAIN_TIFF_OUTPUT_DIR + `/${formattedNow}.tif`;

  return new Promise((res, rej) => {
    const tileFiles = fs
      .readdirSync(TILES_OUTPUT_DIR)
      .filter(f => f.endsWith('.tif'))
      .map(f => path.join(TILES_OUTPUT_DIR, f))
      .join('\n');

    fs.writeFileSync(OPT_OUTPUT_FILENAME, tileFiles);

    const cmd = getCmd(OPT_OUTPUT_FILENAME, MAIN_TIFF_OUTPUT_FILENAME);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        logger.error(error.message);
        return rej(error);
      }
      if (stderr) {
        logger.error(stderr);
        return rej(stderr);
      }

      console.log('stdout:', stdout);
      res(MAIN_TIFF_OUTPUT_FILENAME);
    });
  });
};
