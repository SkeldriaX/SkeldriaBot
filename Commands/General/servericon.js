const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("servericon")
    .setDescription("🖼️ Muestra el ícono del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    // Validar si el servidor tiene icono
    if (!guild.icon) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Sin ícono")
            .setDescription("Este servidor no tiene un ícono configurado.")
            .setColor("Red")
        ],
        ephemeral: true
      });
    }

    const iconURL = guild.iconURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Ícono de ${guild.name}`)
      .setDescription(
        `[Abrir en navegador](${iconURL})\n\n` +
        `Formatos disponibles: ` +
        `[PNG](${guild.iconURL({ size: 1024, extension: "png" })}) | ` +
        `[JPG](${guild.iconURL({ size: 1024, extension: "jpg" })}) | ` +
        `[WEBP](${guild.iconURL({ size: 1024, extension: "webp" })})` +
        (guild.icon?.startsWith("a_") ? ` | [GIF](${guild.iconURL({ size: 1024, extension: "gif" })})` : "")
      )
      .setImage(iconURL)
      .setColor("#0099ff")
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
