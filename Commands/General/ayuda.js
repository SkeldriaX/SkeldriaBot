const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config/config.json");

// Opcional: emojis por categoría
const categoryEmojis = {
  Moderation: "🛡️",
  Fun: "🛠️",
  General: "👤",
  Devs: "💻",
  Fun: "🤩",
  Utilidades: "✅"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ayuda")
    .setDescription("📖 Muestra el menú de ayuda del bot"),

  async execute(interaction) {
    const categories = {};
    const baseDir = path.join(__dirname, "..");

    // Cargar comandos desde /Commands
    fs.readdirSync(baseDir).forEach(folder => {
      const folderPath = path.join(baseDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const commands = fs.readdirSync(folderPath)
          .filter(f => f.endsWith(".js"))
          .map(file => {
            const cmd = require(path.join(folderPath, file));
            if (cmd?.data?.name) {
              return {
                name: cmd.data.name,
                description: cmd.data.description || "Sin descripción."
              };
            }
            return null;
          })
          .filter(Boolean);

        if (commands.length > 0) {
          categories[folder.toLowerCase()] = commands;
        }
      }
    });

    // === Menú principal ===
    const menuOptions = [
      { label: "Inicio", value: "inicio", emoji: "🏠" },
      ...Object.keys(categories).map(cat => {
        return {
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: cat,
          emoji: categoryEmojis[cat] || undefined
        };
      }),
      { label: "Información", value: "info", emoji: "ℹ️" }
    ];

    const dropdown = new StringSelectMenuBuilder()
      .setCustomId("help_select")
      .setPlaceholder("📂 Selecciona una categoría")
      .addOptions(menuOptions);

    const dropdownRow = new ActionRowBuilder().addComponents(dropdown);

    // === Embed inicial ===
    const initialEmbed = new EmbedBuilder()
      .setTitle(`${config.name || "🤖 Bot"} - Centro de Ayuda`)
      .setDescription(
        `Bienvenido **${interaction.user.username}** 👋\n\n` +
        `Usa el menú desplegable para explorar mis comandos por categoría.`
      )
      .setColor("#00A6FF")
      .setFooter({ text: `Solicitado por: ${interaction.user.tag}` })
      .setTimestamp();

    const msg = await interaction.reply({
      embeds: [initialEmbed],
      components: [dropdownRow],
      fetchReply: true
    });

    // === Paginación y generación de embeds ===
    const pageSize = 5;
    let currentCategory = null;
    let currentPage = 0;

    const generateEmbed = (coms, page, cat) => {
      const slice = coms.slice(page * pageSize, (page + 1) * pageSize);
      return new EmbedBuilder()
        .setTitle(`${categoryEmojis[cat] ? categoryEmojis[cat] + " " : ""}${cat.charAt(0).toUpperCase() + cat.slice(1)}`)
        .setColor("#FFA500")
        .setDescription(
          slice.map(c => `\`/${c.name}\` — ${c.description}`).join("\n") || "No hay comandos en esta categoría."
        )
        .setFooter({
          text: `Página ${page + 1}/${Math.ceil(coms.length / pageSize)}`
        })
        .setTimestamp();
    };

    // === Collector para menú ===
    const menuCollector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 0
    });

    menuCollector.on("collect", async i => {
      const selection = i.values[0];

      if (selection === "inicio") {
        currentCategory = null;
        currentPage = 0;
        return i.update({
          embeds: [initialEmbed.setFooter({ text: `Solicitado por: ${i.user.tag}` })],
          components: [dropdownRow]
        });
      }

      if (selection === "info") {
        const infoEmbed = new EmbedBuilder()
          .setTitle("ℹ️ Información del Bot")
          .setDescription(
            `**Nombre:** ${config.name || "Mi Bot"}\n` +
            `**Versión:** ${config.version || "1.0.0"}\n` +
            `**Desarrollador:** <@${config.ownerId || "1039659056907956385"}>`
          )
          .setColor("#00BFFF")
          .setFooter({ text: `Solicitado por: ${i.user.tag}` })
          .setTimestamp();

        return i.update({ embeds: [infoEmbed], components: [dropdownRow] });
      }

      // Categoría seleccionada
      currentCategory = selection;
      currentPage = 0;
      const commandsList = categories[selection] || [];

      const backBtn = new ButtonBuilder()
        .setCustomId("back")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const nextBtn = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(commandsList.length <= pageSize);

      await i.update({
        embeds: [generateEmbed(commandsList, currentPage, selection)],
        components: [
          dropdownRow,
          new ActionRowBuilder().addComponents(backBtn, nextBtn)
        ]
      });
    });

    // === Collector para botones de paginación ===
    const btnCollector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 0
    });

    btnCollector.on("collect", async i => {
      if (!currentCategory) return;
      const commandsList = categories[currentCategory] || [];

      if (i.customId === "next") currentPage++;
      else if (i.customId === "back") currentPage--;

      const backBtn = new ButtonBuilder()
        .setCustomId("back")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0);

      const nextBtn = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled((currentPage + 1) * pageSize >= commandsList.length);

      await i.update({
        embeds: [generateEmbed(commandsList, currentPage, currentCategory)],
        components: [
          dropdownRow,
          new ActionRowBuilder().addComponents(backBtn, nextBtn)
        ]
      });
    });
  }
};

