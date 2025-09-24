async function updateCounters(guild, db) {
  const [rows] = await db.query(
    "SELECT * FROM counter_channels WHERE guildId = ?",
    [guild.id]
  );

  for (const row of rows) {
    const channel = guild.channels.cache.get(row.channelId);
    if (!channel) continue;

    const count = getCount(guild, row.type);
    const newName = row.nameTemplate.replace("{count}", count);

    if (channel.name !== newName) {
      await channel.setName(newName).catch(() => {});
    }
  }
}

function getCount(guild, type) {
  if (type === "total") return guild.memberCount;
  if (type === "users") return guild.members.cache.filter(m => !m.user.bot).size;
  if (type === "bots") return guild.members.cache.filter(m => m.user.bot).size;
  if (type === "boosters") return guild.premiumSubscriptionCount || 0;
  return 0;
}

module.exports = updateCounters;
