const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Buat folder logs jika belum ada
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // Tampil di terminal
    new transports.Console(),
    // Simpan ke file log
    new transports.File({
      filename: path.join(logDir, 'backup.log'),
      maxsize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 5,
    })
  ]
});

module.exports = logger;