const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getGif = require("../../Events/Client/getGif");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("💋 Besa a un usuario")
    .addUserOption(opt =>
      opt.setName("usuario")
        .setDescription("El usuario al que quieres besar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = interaction.client.db;
    const target = interaction.options.getUser("usuario");

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: "❌ No puedes besarte a ti mismo.", ephemeral: true });
    }

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const targetId = target.id;

    const [rows] = await db.query(
      "SELECT * FROM fun_actions WHERE guildId = ? AND userId = ? AND targetId = ? AND action = ?",
      [guildId, userId, targetId, "kiss"]
    );

    let count = 1;
    if (rows.length > 0) {
      count = rows[0].count + 1;
      await db.query(
        "UPDATE fun_actions SET count = ? WHERE guildId = ? AND userId = ? AND targetId = ? AND action = ?",
        [count, guildId, userId, targetId, "kiss"]
      );
    } else {
      await db.query(
        "INSERT INTO fun_actions (guildId, userId, targetId, action, count) VALUES (?, ?, ?, ?, ?)",
        [guildId, userId, targetId, "kiss", 1]
      );
    }

    const gif = await getGif("anime kiss") || "https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif";

    const embed = new EmbedBuilder()
      .setTitle("💋 ¡Beso!")
      .setDescription(`**${interaction.user.username}** ha besado a **${target.username}** (${count} veces)`)
      .setColor("Red")
      .setImage(gif)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
