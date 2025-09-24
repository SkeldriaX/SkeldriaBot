const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("🖼️ Muestra el avatar de un usuario.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("El usuario cuyo avatar deseas ver")
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName("server")
        .setDescription("¿Mostrar el avatar de servidor en lugar del global?")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const showServerAvatar = interaction.options.getBoolean("server") || false;
	
    let avatarURL;
    if (showServerAvatar && member && member.avatar) {
      avatarURL = member.displayAvatarURL({ dynamic: true, size: 1024 });
    } else {
      avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar de ${user.username}`)
      .setDescription(
        `[Abrir en el navegador](${avatarURL})\n` +
        `Formato: PNG | JPG | WEBP | [GIF](${user.displayAvatarURL({ dynamic: true, size: 1024, extension: "gif" })})`
      )
      .setImage(avatarURL)
      .setColor("#0099ff")
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
