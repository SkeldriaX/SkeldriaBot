const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverbanner")
    .setDescription("🖼️ Muestra el banner del servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    // Verificar si el servidor tiene banner
    if (!guild.banner) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Sin banner")
            .setDescription("Este servidor no tiene un banner configurado.")
            .setColor("Red")
        ],
        ephemeral: true
      });
    }

    const bannerURL = guild.bannerURL({ size: 1024 });

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Banner de ${guild.name}`)
      .setDescription(`[Abrir en navegador](${bannerURL})\nFormatos: [PNG](${guild.bannerURL({ size: 1024, extension: "png" })}) | [JPG](${guild.bannerURL({ size: 1024, extension: "jpg" })}) | [WEBP](${guild.bannerURL({ size: 1024, extension: "webp" })})`)
      .setImage(bannerURL)
      .setColor("#0099ff")
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
