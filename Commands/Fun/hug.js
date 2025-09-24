const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const getGif = require("../../Events/Client/getGif");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("🤗 Abraza a un usuario")
    .addUserOption(opt =>
      opt.setName("usuario")
        .setDescription("El usuario al que quieres abrazar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = interaction.client.db;
    const target = interaction.options.getUser("usuario");

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: "❌ No puedes abrazarte a ti mismo.", ephemeral: true });
    }

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const targetId = target.id;

    // Buscar en DB
    const [rows] = await db.query(
      "SELECT * FROM fun_actions WHERE guildId = ? AND userId = ? AND targetId = ? AND action = ?",
      [guildId, userId, targetId, "hug"]
    );

    let count = 1;
    if (rows.length > 0) {
      count = rows[0].count + 1;
      await db.query(
        "UPDATE fun_actions SET count = ? WHERE guildId = ? AND userId = ? AND targetId = ? AND action = ?",
        [count, guildId, userId, targetId, "hug"]
      );
    } else {
      await db.query(
        "INSERT INTO fun_actions (guildId, userId, targetId, action, count) VALUES (?, ?, ?, ?, ?)",
        [guildId, userId, targetId, "hug", 1]
      );
    }

    // GIF dinámico
    const gif = await getGif("anime hug") || "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif";

    const embed = new EmbedBuilder()
      .setTitle("🤗 ¡Abrazo!")
      .setDescription(`**${interaction.user.username}** ha abrazado a **${target.username}** (${count} veces)`)
      .setColor('#ff0000')
      .setImage(gif)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
