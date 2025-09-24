const pool = require("../../Handlers/db.js");

(async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS warns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        warnId VARCHAR(6) NOT NULL,
        userId VARCHAR(50) NOT NULL,
        guildId VARCHAR(50) NOT NULL,
        moderatorId VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log("✅ Tabla 'warns' verificada/creada.");
  } catch (err) {
    console.error("❌ Error creando/verificando tablas:", err);
  }
})();
