const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setnick')
    .setDescription('Cambia el apodo de un usuario en el servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames) // Permiso requerido
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario al que quieres cambiar el apodo.')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('apodo')
        .setDescription('Nuevo apodo para el usuario.')
        .setRequired(true)),

  async execute(interaction) {
    const member = interaction.options.getMember('usuario');
    const nuevoApodo = interaction.options.getString('apodo');

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.reply({ content: '❌ No tengo permisos para cambiar apodos en este servidor.', ephemeral: true });
    }

    try {
      await member.setNickname(nuevoApodo);
      await interaction.reply(`✅ Apodo de **${member.user.tag}** cambiado a: **${nuevoApodo}**`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ No pude cambiar el apodo. Verifica la jerarquía de roles.', ephemeral: true });
    }
  }
};
