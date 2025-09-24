const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tclose")
    .setDescription("Cerrar este ticket manualmente"),

  async execute(interaction, client) {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: "❌ Este canal no es un ticket.", ephemeral: true });
    }
    const url = await client.generateTranscript(interaction.channel);
    await interaction.reply(`🔒 Ticket cerrado por ${interaction.user}\n📝 Transcripción: ${url}`);
    setTimeout(() => interaction.channel.delete(), 5000);
  }
};