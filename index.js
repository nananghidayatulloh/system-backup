/* require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { uploadFile, listRemoteFiles } = require('./src/ftp');
const logger = require('./src/logger');

async function testKoneksi() {
  logger.info('=== Mulai Test Koneksi FTP ===');

  // 1. Buat file test sementara
  const tempDir = path.join(__dirname, 'temp-backup');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const testFile = path.join(tempDir, 'test-backup.txt');
  fs.writeFileSync(testFile, `Test backup\nWaktu: ${new Date().toISOString()}\nStatus: OK`);
  logger.info('File test dibuat: test-backup.txt');

  // 2. Upload ke FTP
  await uploadFile(testFile, process.env.FTP_REMOTE_DIR);

  // 3. Tampilkan isi folder remote
  logger.info('=== Isi folder /backup di HDD ===');
  const files = await listRemoteFiles(process.env.FTP_REMOTE_DIR);
  files.forEach(f => {
    logger.info(`  ${f.name} | ${f.size} | ${f.date}`);
  });

  // 4. Hapus file test lokal
  fs.unlinkSync(testFile);
  logger.info('File test lokal dihapus');
  logger.info('=== Test selesai ✓ ===');
}

testKoneksi().catch(err => {
  logger.error(`Error: ${err.message}`);
  process.exit(1);
}); */

require('dotenv').config();
const { runAllBackup } = require('./src/backup');
const logger = require('./src/logger');

runAllBackup()
  .then(results => {
    const allOk = Object.values(results).every(v => v === true);
    process.exit(allOk ? 0 : 1);
  })
  .catch(err => {
    logger.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });