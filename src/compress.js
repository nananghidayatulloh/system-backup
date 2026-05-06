const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

async function compressFolder(sourceDir, outputZipPath) {
  return new Promise((resolve, reject) => {
    // Pastikan folder output ada
    const outputDir = path.dirname(outputZipPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      logger.info(`Compress selesai: ${path.basename(outputZipPath)} (${sizeMB} MB)`);
      resolve(outputZipPath);
    });

    archive.on('error', (err) => {
      logger.error(`Gagal compress: ${err.message}`);
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function compressFile(sourceFile, outputZipPath) {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(outputZipPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      logger.info(`Compress selesai: ${path.basename(outputZipPath)} (${sizeMB} MB)`);
      resolve(outputZipPath);
    });

    archive.on('error', (err) => {
      logger.error(`Gagal compress: ${err.message}`);
      reject(err);
    });

    archive.pipe(output);
    archive.file(sourceFile, { name: path.basename(sourceFile) });
    archive.finalize();
  });
}

module.exports = { compressFolder, compressFile };