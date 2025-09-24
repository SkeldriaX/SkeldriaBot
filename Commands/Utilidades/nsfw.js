const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const gifs = require("../../config/nsfw.json");

const data = new SlashCommandBuilder()
  .setName("nsfw")
  .setDescription("Comando NSFW (solo canales NSFW)");

Object.keys(gifs).forEach(cat => {
  data.addSubcommand(sub =>
    sub.setName(cat)
      .setDescription(`GIFs NSFW de la categoría: ${cat}`)
  );
});

module.exports = {
  data,
  async execute(interaction) {
    if (!interaction.channel.nsfw) {
      const embed = new EmbedBuilder()
        .setTitle("⚠️ Solo en canales NSFW")
        .setDescription("Este comando solo puede usarse en un canal marcado como **NSFW**.")
        .setColor("Red");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    if (!gifs[sub] || !gifs[sub].length) {
      return interaction.reply(`❌ No hay GIFs en la categoría **${sub}**`);
    }

    const randomGif = gifs[sub][Math.floor(Math.random() * gifs[sub].length)];
    const embed = new EmbedBuilder()
      .setTitle(`🔞 NSFW - ${sub}`)
      .setImage(randomGif)
      .setColor("Random");

    await interaction.reply({ embeds: [embed] });
  }
};
