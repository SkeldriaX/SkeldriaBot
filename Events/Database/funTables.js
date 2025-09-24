module.exports = async (db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS fun_actions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guildId VARCHAR(50) NOT NULL,
      userId VARCHAR(50) NOT NULL,
      targetId VARCHAR(50) NOT NULL,
      action VARCHAR(20) NOT NULL,
      count INT DEFAULT 1,
      UNIQUE KEY unique_action (guildId, userId, targetId, action)
    )
  `);
};