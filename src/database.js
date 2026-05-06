const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

// ─── MySQL Dump ───────────────────────────────────────────
async function dumpMySQL({ host, port, user, password, database, outputDir }) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(outputDir, `mysql-${database}-${timestamp}.sql`);

  // Windows: pastikan mysqldump ada di PATH
  // Ubuntu: sudo apt install mysql-client
  const command = `mysqldump -h ${host} -P ${port} -u ${user} -p"${password}" ${database} > "${outputFile}"`;

  logger.info(`Mulai dump MySQL database: ${database}`);
  await runCommand(command);
  logger.info(`MySQL dump selesai: ${path.basename(outputFile)}`);

  return outputFile;
}

// ─── PostgreSQL Dump ──────────────────────────────────────
async function dumpPostgres({ host, port, user, password, database, outputDir }) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(outputDir, `postgres-${database}-${timestamp}.sql`);

  // Set password via environment variable
  const env = { ...process.env, PGPASSWORD: password };

  // Windows: pastikan pg_dump ada di PATH (dari PostgreSQL installer)
  // Ubuntu: sudo apt install postgresql-client
  const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f "${outputFile}"`;

  logger.info(`Start dump PostgreSQL database: ${database}`);

  return new Promise((resolve, reject) => {
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Failed dump PostgreSQL: ${stderr}`);
        reject(new Error(stderr || error.message));
      } else {
        logger.info(`PostgreSQL dump finished: ${path.basename(outputFile)}`);
        resolve(outputFile);
      }
    });
  });
}

module.exports = { dumpMySQL, dumpPostgres };