module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    // ========== Select Menu de Tickets ==========
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_category") {
      try {
        const handler = require("../Tickets/ticketButtons.js");
        await handler.handleCategory(interaction, client);
      } catch (err) {
        console.error("❌ Error en handleCategory:", err);
        await interaction.reply({ content: "❌ No se pudo crear el ticket.", ephemeral: true });
      }
    }

    // ========== Botones de Tickets ==========
    if (interaction.isButton()) {
      try {
        const handler = require("../Tickets/ticketButtons.js");
        await handler.handleButton(interaction, client);
      } catch (err) {
        console.error("❌ Error en handleButton:", err);
        await interaction.reply({ content: "❌ No se pudo procesar el botón.", ephemeral: true });
      }
    }
  }
};
