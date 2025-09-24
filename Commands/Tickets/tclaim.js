const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tclaim")
    .setDescription("Reclamar el ticket actual"),

  async execute(interaction) {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: "❌ Este canal no es un ticket.", ephemeral: true });
    }
    await interaction.reply(`✅ Ticket reclamado por ${interaction.user}`);
  }
};