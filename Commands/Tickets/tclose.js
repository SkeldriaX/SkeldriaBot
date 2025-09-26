const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tclose")
    .setDescription("Cerrar este ticket manualmente"),

  async execute(interaction, client) {
    // Leer los channelName válidos desde tsconfig.json
    const config = require("../../Tickets/tsconfig.json");
    const validNames = config.categories.map(c => c.channelName);
    if (!validNames.includes(interaction.channel.name)) {
      return interaction.reply({ content: "❌ Este canal no es un ticket.", ephemeral: true });
    }
    const url = await client.generateTranscript(interaction.channel);
    await interaction.reply(`🔒 Ticket cerrado por ${interaction.user}\n📝 Transcripción: ${url}`);
    setTimeout(() => interaction.channel.delete(), 5000);
  }
};