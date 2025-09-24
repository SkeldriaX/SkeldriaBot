const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const tsconfigPath = path.join(__dirname, "..", "..", "Tickets", "tsconfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tpanel")
    .setDescription("Enviar panel de tickets"),

  async execute(interaction) {
    const categories = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

    const embed = new EmbedBuilder()
      .setTitle("🎫 Sistema de Tickets")
      .setDescription("Selecciona una categoría para abrir un ticket")
      .setColor("Blue");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_category")
      .setPlaceholder("Selecciona una categoría...");

    categories.forEach(cat => {
      menu.addOptions({
        label: cat.label,
        value: cat.id,
        description: cat.description || "Sin descripción",
        emoji: cat.emoji || "🎟️"
      });
    });

    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};