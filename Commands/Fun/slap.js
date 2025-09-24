const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getGif = require("../../Events/Client/getGif");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription("👋 Abofetea a un usuario")
    .addUserOption(opt =>
      opt.setName("usuario")
        .setDescription("El usuario al que quieres abofetear")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = interaction.client.db;
    const target = interaction.options.getUser("usuario");

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: "❌ No puedes abofetearte a ti mismo.", ephemeral: true });
    }

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const targetId = target.id;

    const [rows] = await db.query(
      "SELECT * FROM fun_actions WHERE guildId = ? AND userId = ? AND targetId = ? AND action = ?",
      [guildId, userId, targetId, "slap"]
    );

    let count = 1;
    if (rows.length > 0) {
      count = rows[0].count + 1;
      await db.query(
        "UPDATE fun_actions SET count = ? WHERE guildId = ? AND userId = ? AND targetId = ? AND action = ?",
        [count, guildId, userId, targetId, "slap"]
      );
    } else {
      await db.query(
        "INSERT INTO fun_actions (guildId, userId, targetId, action, count) VALUES (?, ?, ?, ?, ?)",
        [guildId, userId, targetId, "slap", 1]
      );
    }

    const gif = await getGif("anime slap") || "https://media.giphy.com/media/jLeyZWgtwgr2U/giphy.gif";

    const embed = new EmbedBuilder()
      .setTitle("👋 ¡Bofetada!")
      .setDescription(`**${interaction.user.username}** ha abofeteado a **${target.username}** (${count} veces)`)
      .setColor("Yellow")
      .setImage(gif)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
