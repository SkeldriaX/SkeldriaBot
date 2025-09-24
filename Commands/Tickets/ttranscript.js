const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ttranscript")
    .setDescription("Genera transcripción manualmente"),

  async execute(interaction, client) {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: "❌ Este canal no es un ticket.", ephemeral: true });
    }
    const url = await client.generateTranscript(interaction.channel);
    await interaction.reply(`📝 Transcripción generada: ${url}`);
  }
};