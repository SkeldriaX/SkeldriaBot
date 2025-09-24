const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const emoji = require("../../config/emojis.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("📊 Muestra información detallada sobre el servidor."),

  async execute(interaction) {
    const guild = interaction.guild;

    // Datos básicos
    const owner = await guild.fetchOwner();
    const memberCount = guild.memberCount;
    const boosts = guild.premiumSubscriptionCount || 0;
    const guildId = guild.id;
    const emojis = guild.emojis.cache.size;
    const stickers = guild.stickers.cache.size;
    const rolesCount = guild.roles.cache.size;
    const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F> (\`${Math.floor((Date.now() - guild.createdTimestamp) / (1000 * 60 * 60 * 24))} días\`)`;
    const verification = guild.verificationLevel;
    const channels = {
      text: guild.channels.cache.filter(c => c.type === 0).size,
      voice: guild.channels.cache.filter(c => c.type === 2).size,
      categories: guild.channels.cache.filter(c => c.type === 4).size
    };

    // Embed
    const serverInfoEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${emoji.info || "ℹ️"} Información de ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
      .setImage(guild.bannerURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: `${emoji.crown || "👑"} Owner`, value: `${owner.user.tag}`, inline: true },
        { name: `${emoji.member || "👥"} Miembros`, value: `${memberCount}`, inline: true },
        { name: `${emoji.booster || "🚀"} Boosts`, value: `${boosts}`, inline: true },
        { name: `${emoji.id || "🆔"} ID`, value: `\`${guildId}\``, inline: true },
        { name: `${emoji.emojis || "😄"} Emojis`, value: `${emojis}`, inline: true },
        { name: `${emoji.sticker || "🏷️"} Stickers`, value: `${stickers}`, inline: true },
        { name: `${emoji.info || "🎭"} Roles`, value: `${rolesCount}`, inline: true },
        { name: `${emoji.channel || "📂"} Canales`, value: `📝 ${channels.text} texto\n🔊 ${channels.voice} voz\n📁 ${channels.categories} categorías`, inline: true },
        { name: `${emoji.date || "📅"} Creado el`, value: createdAt, inline: false },
        { name: `${emoji.shield || "🛡️"} Nivel de verificación`, value: `${verification}`, inline: true }
      )
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [serverInfoEmbed] });
  }
};
