const ftp = require('basic-ftp');
const path = require('path');
const logger = require('./logger');

async function connectFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = false; // set true untuk debug
  try {
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: false // set true jika pakai FTPS
    });

    logger.info(`FTP Connection Succesfully ${process.env.FTP_HOST}`);
    return client;

  } catch (err) {
    logger.error(`FTP Connection fail: ${err.message}`);
    client.close();
    throw err;
  }
}

async function uploadFile(localFilePath, remoteDir) {
  const client = await connectFTP();

  try {
    // Pastikan folder remote ada
    await client.ensureDir(remoteDir);
    logger.info(`Upload to folder: ${remoteDir}`);

    // Upload file
    const fileName = path.basename(localFilePath);
    await client.uploadFrom(localFilePath, fileName);
    logger.info(`Successfully upload: ${fileName}`);

  } catch (err) {
    logger.error(`Fail upload: ${err.message}`);
    throw err;

  } finally {
    client.close();
    logger.info('FTP Connection Close');
  }
}

async function listRemoteFiles(remoteDir) {
  const client = await connectFTP();

  try {
    await client.cd(remoteDir);
    const files = await client.list();
    return files.map(f => ({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
      date: f.modifiedAt
    }));

  } catch (err) {
    logger.error(`Failed list file: ${err.message}`);
    throw err;

  } finally {
    client.close();
  }
}

module.exports = { connectFTP, uploadFile, listRemoteFiles };