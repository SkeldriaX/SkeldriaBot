module.exports = async (db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS counter_channels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guildId VARCHAR(50) NOT NULL,
      channelId VARCHAR(50) NOT NULL,
      type ENUM('total', 'users', 'bots', 'boosters') NOT NULL,
      nameTemplate VARCHAR(100) NOT NULL,
      UNIQUE KEY unique_counter (guildId, type)
    )
  `);
};
