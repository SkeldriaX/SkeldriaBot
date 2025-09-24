const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionsBitField, 
  ChannelType 
} = require("discord.js");
const emoji = require("../../emojis.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rename")
    .setDescription("✏️ Renombra un canal.")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("El canal que deseas renombrar")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("newname")
        .setDescription("El nuevo nombre para el canal")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const newName = interaction.options.getString("newname");

    // Verificar permisos del usuario
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: `${emoji.cross || "❌"} | No tienes permisos para renombrar canales.`,
        ephemeral: true
      });
    }

    // Verificar permisos del bot
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: `${emoji.cross || "❌"} | No tengo permisos para renombrar canales.`,
        ephemeral: true
      });
    }

    // Verificar tipo de canal
    const allowedTypes = [
      ChannelType.GuildText,
      ChannelType.GuildVoice,
      ChannelType.GuildForum,
      ChannelType.GuildCategory
    ];
    if (!allowedTypes.includes(channel.type)) {
      return interaction.reply({
        content: `${emoji.cross || "❌"} | No se puede renombrar este tipo de canal.`,
        ephemeral: true
      });
    }

    // Validación del nombre
    if (newName.length < 2 || newName.length > 100) {
      return interaction.reply({
        content: `${emoji.warn || "⚠️"} | El nombre debe tener entre 2 y 100 caracteres.`,
        ephemeral: true
      });
    }

    try {
      const oldName = channel.name;
      await channel.setName(newName);

      const embed = new EmbedBuilder()
        .setTitle(`${emoji.channel || "📢"} | Canal renombrado`)
        .setDescription(
          `${emoji.info || "ℹ️"} | El canal ${channel} fue renombrado:\n\n` +
          `📝 Antes: **${oldName}**\n` +
          `✅ Ahora: **${newName}**`
        )
        .setColor(0x00ff00)
        .setFooter({ text: `Acción realizada por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("❌ Error renombrando canal:", error);
      await interaction.reply({
        content: `${emoji.cross || "❌"} | Hubo un error al intentar renombrar el canal. Asegúrate de que el bot tenga los permisos necesarios.`,
        ephemeral: true
      });
    }
  }
};
