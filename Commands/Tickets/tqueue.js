const { SlashCommandBuilder } = require("discord.js");

let ticketQueue = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tqueue")
    .setDescription("Muestra tu posición en la cola de tickets"),

  async execute(interaction) {
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({ content: "❌ Este canal no es un ticket.", ephemeral: true });
    }
    if (!ticketQueue.includes(interaction.channel.id)) {
      ticketQueue.push(interaction.channel.id);
    }
    const position = ticketQueue.indexOf(interaction.channel.id) + 1;
    await interaction.reply(`📊 Tu ticket está en la posición **${position}** de la cola.`);
  }
};