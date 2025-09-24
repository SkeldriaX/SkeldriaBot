const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const jokes = require("../../config/jokes.json");

// Crear comando dinámicamente en base a las categorías del jokes.json
const data = new SlashCommandBuilder()
  .setName("joke")
  .setDescription("Muestra un chiste de distintas categorías.");

Object.keys(jokes).forEach(cat => {
  data.addSubcommand(sub =>
    sub.setName(cat)
      .setDescription(`Chistes de la categoría: ${cat}`)
  );
});

module.exports = {
  data,
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // Verificar si la categoría existe
    if (!jokes[sub] || !jokes[sub].length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Sin chistes")
            .setDescription(`No hay chistes en la categoría **${sub}**`)
            .setColor("Red")
        ],
        ephemeral: true
      });
    }

    // Escoger un chiste aleatorio
    const randomJoke = jokes[sub][Math.floor(Math.random() * jokes[sub].length)];

    const embed = new EmbedBuilder()
      .setTitle(`😂 Chiste (${sub})`)
      .setDescription(randomJoke)
      .setColor("Random")
      .setFooter({ text: `Categoría: ${sub}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
