const path = require('path');
const fs = require('fs');
const { compressFolder, compressFile } = require('./compress');
const { dumpMySQL, dumpPostgres } = require('./database');
const { uploadFile } = require('./ftp');
const logger = require('./logger');

// hapus file/folder temporary
function cleanup(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
      logger.info(`Cleanup: ${path.basename(filePath)} cleaned`);
    }
  } catch (err) {
    logger.warn(`Fail cleanup: ${err.message}`);
  }
}

// buat nama file dengan timestamp
function makeFileName(prefix) {
  const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `${prefix}-${ts}.zip`;
}

// ─── Backup File & Folder ─────────────────────────────────
async function backupFiles() {
  const sourceDir  = process.env.SOURCE_DIR;
  const backupDir  = path.resolve(process.env.BACKUP_DIR);
  const remoteDir  = process.env.FTP_REMOTE_DIR;
  const zipName    = makeFileName('files');
  const zipPath    = path.join(backupDir, zipName);

  logger.info(`--- Backup files: ${sourceDir}`);

  try {
    await compressFolder(sourceDir, zipPath);
    await uploadFile(zipPath, remoteDir + '/files');
    logger.info('Backup files finished ✓');
  } finally {
    cleanup(zipPath);
  }
}

// ─── Backup MySQL ─────────────────────────────────────────
async function backupMySQL() {
  const backupDir = path.resolve(process.env.BACKUP_DIR);
  const remoteDir = process.env.FTP_REMOTE_DIR;

  logger.info('--- Backup MySQL');

  let sqlFile, zipPath;
  try {
    sqlFile = await dumpMySQL({
      host:     process.env.MYSQL_HOST,
      port:     process.env.MYSQL_PORT,
      user:     process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
      outputDir: backupDir
    });

    zipPath = sqlFile.replace('.sql', '.zip');
    await compressFile(sqlFile, zipPath);
    await uploadFile(zipPath, remoteDir + '/mysql');
    logger.info('Backup MySQL finished ✓');

  } finally {
    cleanup(sqlFile);
    cleanup(zipPath);
  }
}

// ─── Backup PostgreSQL ────────────────────────────────────
async function backupPostgres() {
  const backupDir = path.resolve(process.env.BACKUP_DIR);
  const remoteDir = process.env.FTP_REMOTE_DIR;

  logger.info('--- Backup PostgreSQL');

  let sqlFile, zipPath;
  try {
    sqlFile = await dumpPostgres({
      host:     process.env.PG_HOST,
      port:     process.env.PG_PORT,
      user:     process.env.PG_USER,
      password: process.env.PG_PASS,
      database: process.env.PG_DB,
      outputDir: backupDir
    });

    zipPath = sqlFile.replace('.sql', '.zip');
    await compressFile(sqlFile, zipPath);
    await uploadFile(zipPath, remoteDir + '/postgres');
    logger.info('Backup PostgreSQL selesai ✓');

  } finally {
    cleanup(sqlFile);
    cleanup(zipPath);
  }
}

// ─── Run All ────────────────────────────────
async function runAllBackup() {
  logger.info('=============================');
  logger.info('  MULAI PROSES BACKUP SEMUA  ');
  logger.info('=============================');

  const results = { files: false, mysql: false, postgres: false };

  // Backup files
 /*  try {
    await backupFiles();
    results.files = true;
  } catch (err) {
    logger.error(`Backup files fail: ${err.message}`);
  } */

  // Backup MySQL
  try {
    await backupMySQL();
    results.mysql = true;
  } catch (err) {
    logger.error(`Backup MySQL fail: ${err.message}`);
  }

  // Backup PostgreSQL
/*   try {
    await backupPostgres();
    results.postgres = true;
  } catch (err) {
    logger.error(`Backup PostgreSQL fail: ${err.message}`);
  } */

  // Ringkasan hasil
  logger.info('=============================');
  logger.info('       BACKUP                ');
  logger.info('=============================');
  //logger.info(`Files    : ${results.files    ? '✓ OK' : '✗ Fail'}`);
  logger.info(`MySQL    : ${results.mysql    ? '✓ OK' : '✗ Fail'}`);
  //logger.info(`PostgreSQL: ${results.postgres ? '✓ OK' : '✗ Fail'}`);

  return results;
}

module.exports = { runAllBackup, backupFiles, backupMySQL, backupPostgres };