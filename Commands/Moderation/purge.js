const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("🧹 Borra mensajes en masa")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a borrar (máx 100)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("cantidad");

    // ========== VALIDACIONES ==========
    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "❌ Solo puedes borrar entre **1 y 100** mensajes.",
        ephemeral: true
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: "⚠️ No tengo permisos para borrar mensajes.",
        ephemeral: true
      });
    }

    try {
      // Obtener mensajes
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      const deleted = await interaction.channel.bulkDelete(messages, true);

      // Contar mensajes por usuario
      const userCount = {};
      deleted.forEach(msg => {
        if (!msg.author) return; // mensajes antiguos pueden no tener autor
        if (!userCount[msg.author.tag]) userCount[msg.author.tag] = 0;
        userCount[msg.author.tag]++;
      });

      let description = "";
      for (const [user, count] of Object.entries(userCount)) {
        description += `👤 **${user}** — ${count}\n`;
      }

      if (!description) description = "No se pudieron contar los mensajes.";

      // Embed de resultado
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("🧹 Mensajes eliminados")
        .setDescription(description)
        .setFooter({ 
          text: `Borré ${deleted.size} mensajes en total. | Moderador: ${interaction.user.tag}` 
        })
        .setTimestamp();

      const reply = await interaction.reply({ embeds: [embed], ephemeral: false });
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error("❌ Error en /purge:", error);
      return interaction.reply({ 
        content: "❌ Hubo un error al intentar borrar los mensajes.", 
        ephemeral: true 
      });
    }
  }
};
