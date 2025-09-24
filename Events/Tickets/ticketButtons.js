const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");
const categories = require("../../Tickets/tsconfig.json").categories;

module.exports = {
  async handleCategory(interaction, client) {
    const categoryId = interaction.values[0];
    const categoryConfig = categories.find(c => c.id === categoryId);

    if (!categoryConfig) {
      return interaction.reply({ content: "❌ Categoría inválida.", ephemeral: true });
    }

    try {
      const channel = await interaction.guild.channels.create({
        name: categoryConfig.channelName || `ticket-${interaction.user.username}`,
        type: 0, // Canal de texto
        parent: categoryConfig.categoryId || null,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
        ]
      });

      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`🎟️ Ticket - ${categoryConfig.label}`)
        .setDescription("Un miembro del staff atenderá tu ticket pronto.")
        .addFields(
          { name: "Categoría", value: categoryConfig.label, inline: true },
          { name: "Usuario", value: `<@${interaction.user.id}>`, inline: true }
        )
        .setColor("Green");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ticket_claim").setLabel("Reclamar").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("ticket_close").setLabel("Cerrar").setStyle(ButtonStyle.Danger)
      );

      await channel.send({ embeds: [welcomeEmbed], components: [row] });
      await interaction.reply({ content: `✅ Ticket creado: ${channel}`, ephemeral: true });
    } catch (err) {
      console.error("❌ Error al crear canal de ticket:", err);
      await interaction.reply({ content: "❌ No se pudo crear el ticket.", ephemeral: true });
    }
  },

  async handleButton(interaction, client) {
    if (interaction.customId === "ticket_claim") {
      return interaction.reply(`✅ Ticket reclamado por ${interaction.user}`);
    }

    if (interaction.customId === "ticket_close") {
      const confirmEmbed = new EmbedBuilder()
        .setTitle("⚠️ Confirmación de cierre")
        .setDescription("¿Estás seguro de cerrar este ticket? Se generará transcripción automáticamente.")
        .setColor("Red");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("confirm_close").setLabel("Confirmar").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("cancel_close").setLabel("Cancelar").setStyle(ButtonStyle.Secondary)
      );

      return interaction.reply({ embeds: [confirmEmbed], components: [row] });
    }

    if (interaction.customId === "confirm_close") {
      const url = await client.generateTranscript(interaction.channel);
      await interaction.channel.send(`📝 Transcripción generada: ${url}`);
      return interaction.channel.delete();
    }

    if (interaction.customId === "cancel_close") {
      return interaction.reply({ content: "❌ Cancelado el cierre.", ephemeral: true });
    }
  }
};
