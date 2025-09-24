// Commands/Utils/role.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const emoji = require('../../config/emojis.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("➕➖ Agrega o quita roles a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand =>
      subcommand
        .setName("add")
        .setDescription("Agregar un rol a un usuario")
        .addUserOption(option =>
          option.setName("usuario")
            .setDescription("Usuario al que se le agregará el rol")
            .setRequired(true))
        .addRoleOption(option =>
          option.setName("rol")
            .setDescription("Rol que se agregará")
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName("remove")
        .setDescription("Quitar un rol a un usuario")
        .addUserOption(option =>
          option.setName("usuario")
            .setDescription("Usuario al que se le quitará el rol")
            .setRequired(true))
        .addRoleOption(option =>
          option.setName("rol")
            .setDescription("Rol que se quitará")
            .setRequired(true))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("usuario");
    const role = interaction.options.getRole("rol");
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: `${emoji.cross} No encontré a ese usuario en el servidor.`,
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: `${emoji.cross} No tengo permisos para gestionar roles.`,
        ephemeral: true
      });
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        content: `${emoji.warn} No puedo modificar el rol **@${role.name}** porque está por encima o igual a mi jerarquía.`,
        ephemeral: true
      });
    }

    try {
      if (subcommand === "add") {
        if (member.roles.cache.has(role.id)) {
          return interaction.reply({
            content: `${emoji.warn} El usuario ya tiene el rol **@${role.name}**.`,
            ephemeral: true
          });
        }

        await member.roles.add(role);

        const embed = new EmbedBuilder()
          .setTitle("✅ Rol agregado")
          .setDescription(`${emoji.success} Se agregó el rol **@${role.name}** a **${user.tag}**`)
          .setColor("Green")
          .setTimestamp()
          .setFooter({ text: `Acción realizada por ${interaction.user.tag}` });

        return interaction.reply({ embeds: [embed] });
      }

      if (subcommand === "remove") {
        if (!member.roles.cache.has(role.id)) {
          return interaction.reply({
            content: `${emoji.warn} El usuario no tiene el rol **@${role.name}**.`,
            ephemeral: true
          });
        }

        await member.roles.remove(role);

        const embed = new EmbedBuilder()
          .setTitle("✅ Rol eliminado")
          .setDescription(`${emoji.success} Se quitó el rol **@${role.name}** a **${user.tag}**`)
          .setColor("Red")
          .setTimestamp()
          .setFooter({ text: `Acción realizada por ${interaction.user.tag}` });

        return interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("❌ Error en /role:", error);
      return interaction.reply({
        content: "⚠️ Ocurrió un error al intentar modificar el rol.",
        ephemeral: true
      });
    }
  },
};
