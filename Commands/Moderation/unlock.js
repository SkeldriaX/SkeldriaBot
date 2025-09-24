const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("🔓 Desbloquea el canal actual para que los usuarios puedan enviar mensajes.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel;

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription("No tengo permisos para administrar canales.")
            .setColor("Red")
        ],
        ephemeral: true
      });
    }

    try {
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: true,
      });

      const embed = new EmbedBuilder()
        .setTitle("🔓 Canal desbloqueado")
        .setDescription(`El canal **#${channel.name}** ha sido desbloqueado.`)
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: `Acción realizada por ${interaction.user.tag}` });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error("❌ Error en /unlock:", err);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⚠️ Error")
            .setDescription("Hubo un problema al intentar desbloquear el canal.")
            .setColor("Orange")
        ],
        ephemeral: true
      });
    }
  }
};
