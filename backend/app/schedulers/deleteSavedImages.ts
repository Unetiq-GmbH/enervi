import schedule from "node-schedule";
import fs from "fs";
import path from "path";

const EVERY_MIDNIGHT = "0 0 * * *";
const uploadsDirectory = path.join(__dirname, "../../uploads");

export default (): void => {
  schedule.scheduleJob(EVERY_MIDNIGHT, function () {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    fs.readdir(uploadsDirectory, (err, files) => {
      if (err) {
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(uploadsDirectory, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            return;
          }

          if (stats.isFile() && stats.mtime < twentyFourHoursAgo) {
            fs.unlink(filePath, (err) => {
              if (err) {
                return;
              }
            });
          }
        });
      });
    });
  });
};
