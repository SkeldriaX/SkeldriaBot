const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const respuestas = [
  "Sí ✅",
  "No ❌",
  "Tal vez 🤔",
  "Pregunta de nuevo más tarde ⏳",
  "Definitivamente sí 🎯",
  "Definitivamente no 🚫",
  "Las señales apuntan a que sí 🔮",
  "No cuentes con ello 🙅",
  "Es incierto, inténtalo otra vez 🤷",
  "Probablemente 😉",
  "Muy dudoso 😬",
  "Sin dudas 👍",
  "Mejor no te lo digo ahora 🙊",
  "La respuesta es obvia 😏",
  "No hay forma 👎",
  "Claro como el agua 💧",
  "No puedo predecirlo 🌫️",
  "Todo apunta a que no 📉",
  "Todo apunta a que sí 📈",
  "La suerte está de tu lado 🍀"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Hazle una pregunta a la bola mágica 🎱')
    .addStringOption(option =>
      option.setName('pregunta')
        .setDescription('La pregunta que quieres hacer')
        .setRequired(true)
    ),

  async execute(interaction) {
    const pregunta = interaction.options.getString('pregunta');
    const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];

    const embed = new EmbedBuilder()
      .setTitle("🎱 Bola Mágica 8")
      .setColor("Random")
      .addFields(
        { name: "❓ Pregunta", value: pregunta },
        { name: "✨ Respuesta", value: respuesta }
      )
      .setFooter({ text: `Pedido por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
