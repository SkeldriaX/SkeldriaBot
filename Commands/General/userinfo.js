const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const emoji = require("../../config/emojis.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 Muestra información sobre un usuario")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("El usuario del que deseas obtener información")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("usuario") || interaction.user;
      let member;
      try {
        member = await interaction.guild.members.fetch(user.id);
      } catch {
        member = null; // El usuario puede no estar en el servidor
      }

      const isBooster = member?.premiumSince ? `Sí, desde <t:${Math.floor(member.premiumSince / 1000)}:R>` : "No";
      const joinedDate = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : "No disponible";
      const createdDate = `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`;
      const roles = member
        ? member.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .map(r => r.toString())
            .join(", ") || "Ninguno"
        : "No disponible";
      const highestRole = member ? member.roles.highest.toString() : "No disponible";
      const status = member?.presence?.status || "offline";

      const userInfoEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`📌 Información de ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
        .addFields(
          { name: `${emoji.user || "👤"} Tag`, value: `${user.tag}`, inline: true },
          { name: `${emoji.id || "🆔"} ID`, value: `\`${user.id}\``, inline: true },
          { name: `${emoji.booster || "🚀"} Booster`, value: isBooster, inline: true },
          { name: `${emoji.info || "📅"} En el servidor desde`, value: joinedDate, inline: true },
          { name: `${emoji.discord || "💠"} Miembro de Discord desde`, value: createdDate, inline: true },
          { name: `${emoji.shield || "🛡️"} Rol más alto`, value: highestRole, inline: true },
          { name: `${emoji.status || "📡"} Estado`, value: status, inline: true },
          { name: `${emoji.roles || "🎭"} Roles`, value: roles, inline: false }
        )
        .setFooter({
          text: `Solicitado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [userInfoEmbed] });
    } catch (err) {
      console.error("❌ Error en /userinfo:", err);
      await interaction.reply({
        content: "❌ Ocurrió un error al obtener la información del usuario.",
        ephemeral: true
      });
    }
  }
};
