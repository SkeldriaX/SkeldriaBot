const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require("discord.js");

// ===================== GENERADOR DE ID =====================
function generarWarnId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("⚠️ Advertencias")
    .addSubcommand(sub =>
      sub
        .setName("user")
        .setDescription("Añadir una advertencia a un usuario")
        .addUserOption(opt =>
          opt.setName("usuario").setDescription("Usuario a advertir").setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName("razon").setDescription("Razón de la advertencia").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("view")
        .setDescription("Ver las advertencias de un usuario")
        .addUserOption(opt =>
          opt.setName("usuario").setDescription("Usuario").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Eliminar una advertencia por ID")
        .addUserOption(opt =>
          opt.setName("usuario").setDescription("Usuario").setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName("id").setDescription("ID de la advertencia (6 caracteres)").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("clear")
        .setDescription("Eliminar TODAS las advertencias de un usuario")
        .addUserOption(opt =>
          opt.setName("usuario").setDescription("Usuario").setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("usuario");
    const db = interaction.client.db;

    // ===================== /warn user =====================
    if (sub === "user") {
      const reason = interaction.options.getString("razon");

      // Generar ID único por servidor
      let warnId;
      let existe = true;
      while (existe) {
        warnId = generarWarnId();
        const [rows] = await db.query(
          "SELECT * FROM warns WHERE warnId = ? AND guildId = ?",
          [warnId, interaction.guild.id]
        );
        if (rows.length === 0) existe = false;
      }

      await db.query(
        "INSERT INTO warns (warnId, userId, guildId, moderatorId, reason) VALUES (?, ?, ?, ?, ?)",
        [warnId, user.id, interaction.guild.id, interaction.user.id, reason]
      );

      const embed = new EmbedBuilder()
        .setTitle("⚠️ Usuario advertido")
        .setDescription(`El usuario ${user} ha recibido una advertencia.`)
        .addFields(
          { name: "🔑 ID de la Warn", value: warnId, inline: true },
          { name: "👮 Moderador", value: `<@${interaction.user.id}>`, inline: true },
          { name: "📄 Razón", value: reason }
        )
        .setColor("Yellow")
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ===================== /warn view =====================
    if (sub === "view") {
      let [rows] = await db.query(
        "SELECT * FROM warns WHERE userId = ? AND guildId = ? ORDER BY date DESC",
        [user.id, interaction.guild.id]
      );

      if (rows.length === 0) {
        return interaction.reply({
          content: "✅ Este usuario no tiene advertencias.",
          ephemeral: true
        });
      }

      let page = 0;
      const pageSize = 5;

      const generatePage = () => {
        const slice = rows.slice(page * pageSize, (page + 1) * pageSize);
        const embed = new EmbedBuilder()
          .setTitle(`📋 Advertencias de ${user.tag}`)
          .setColor("Orange")
          .setDescription("Pulsa un botón para ver más detalles de cada advertencia.")
          .setFooter({
            text: `Página ${page + 1}/${Math.ceil(rows.length / pageSize)}`
          });

        const warnButtons = slice.map(warn =>
          new ButtonBuilder()
            .setCustomId(`warn_${warn.warnId}`)
            .setLabel(warn.warnId)
            .setEmoji("⚠️")
            .setStyle(ButtonStyle.Secondary)
        );

        const navButtons = [
          new ButtonBuilder()
            .setCustomId("prev_page")
            .setLabel("Anterior")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("next_page")
            .setLabel("Siguiente")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled((page + 1) * pageSize >= rows.length)
        ];

        const rowsArr = [];
        if (warnButtons.length > 0) rowsArr.push(new ActionRowBuilder().addComponents(warnButtons));
        rowsArr.push(new ActionRowBuilder().addComponents(navButtons));

        return { embed, components: rowsArr };
      };

      const { embed, components } = generatePage();
      const msg = await interaction.reply({
        embeds: [embed],
        components,
        fetchReply: true
      });

      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120000
      });

      collector.on("collect", async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "❌ No puedes interactuar con este menú.",
            ephemeral: true
          });
        }

        // Navegación
        if (i.customId === "prev_page") {
          page--;
          const { embed, components } = generatePage();
          return i.update({ embeds: [embed], components });
        }

        if (i.customId === "next_page") {
          page++;
          const { embed, components } = generatePage();
          return i.update({ embeds: [embed], components });
        }

        // Mostrar detalles
        if (i.customId.startsWith("warn_")) {
          const warnId = i.customId.replace("warn_", "");
          const [warn] = await db.query(
            "SELECT * FROM warns WHERE warnId = ? AND guildId = ?",
            [warnId, interaction.guild.id]
          );

          if (warn[0]) {
            const warnEmbed = new EmbedBuilder()
              .setTitle(`📌 Detalles de la Warn ${warnId}`)
              .setColor("Red")
              .addFields(
                { name: "👤 Usuario", value: `<@${warn[0].userId}>`, inline: true },
                { name: "👮 Moderador", value: `<@${warn[0].moderatorId}>`, inline: true },
                { name: "📄 Razón", value: warn[0].reason },
                { name: "📅 Fecha", value: warn[0].date.toLocaleString() }
              );

            const removeBtn = new ButtonBuilder()
              .setCustomId(`remove_${warnId}`)
              .setLabel("Remover")
              .setEmoji("🗑️")
              .setStyle(ButtonStyle.Danger);

            return i.reply({
              embeds: [warnEmbed],
              components: [new ActionRowBuilder().addComponents(removeBtn)],
              ephemeral: true
            });
          }
        }

        // Eliminar warn
        if (i.customId.startsWith("remove_")) {
          const warnId = i.customId.replace("remove_", "");
          const [result] = await db.query(
            "DELETE FROM warns WHERE warnId = ? AND guildId = ?",
            [warnId, interaction.guild.id]
          );

          if (result.affectedRows === 0) {
            return i.reply({
              content: "❌ No se pudo eliminar, ya no existe.",
              ephemeral: true
            });
          }

          [rows] = await db.query(
            "SELECT * FROM warns WHERE userId = ? AND guildId = ? ORDER BY date DESC",
            [user.id, interaction.guild.id]
          );

          if (rows.length === 0) {
            return msg.edit({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`📋 Advertencias de ${user.tag}`)
                  .setDescription("✅ Sin advertencias.")
              ],
              components: []
            });
          }

          if (page * pageSize >= rows.length) page = Math.max(0, page - 1);
          const { embed, components } = generatePage();
          await msg.edit({ embeds: [embed], components });

          return i.reply({
            content: `✅ La advertencia **${warnId}** fue eliminada.`,
            ephemeral: true
          });
        }
      });

      collector.on("end", () => {
        msg.edit({ components: [] }).catch(() => {});
      });
    }

    // ===================== /warn remove =====================
    if (sub === "remove") {
      const id = interaction.options.getString("id");

      const [result] = await db.query(
        "DELETE FROM warns WHERE warnId = ? AND userId = ? AND guildId = ?",
        [id, user.id, interaction.guild.id]
      );

      if (result.affectedRows === 0) {
        return interaction.reply({
          content: "❌ No se encontró esa advertencia.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("✅ Warn eliminada")
        .setDescription(
          `Se eliminó la advertencia con ID **${id}** del usuario ${user}.`
        )
        .setColor("Green");

      return interaction.reply({ embeds: [embed] });
    }

    // ===================== /warn clear =====================
    if (sub === "clear") {
      const confirmEmbed = new EmbedBuilder()
        .setTitle("⚠️ Confirmación requerida")
        .setDescription(
          `¿Seguro que deseas eliminar **todas** las advertencias de ${user}? Esta acción no se puede deshacer.`
        )
        .setColor("Red");

      const yesBtn = new ButtonBuilder()
        .setCustomId("clear_yes")
        .setLabel("Sí, borrar todo")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Danger);

      const noBtn = new ButtonBuilder()
        .setCustomId("clear_no")
        .setLabel("Cancelar")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(yesBtn, noBtn);

      const msg = await interaction.reply({
        embeds: [confirmEmbed],
        components: [row],
        ephemeral: true,
        fetchReply: true
      });

      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 20000,
        max: 1
      });

      collector.on("collect", async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "❌ Solo el moderador que ejecutó el comando puede confirmar.",
            ephemeral: true
          });
        }

        if (i.customId === "clear_yes") {
          const [result] = await db.query(
            "DELETE FROM warns WHERE userId = ? AND guildId = ?",
            [user.id, interaction.guild.id]
          );

          if (result.affectedRows === 0) {
            return i.update({
              embeds: [
                new EmbedBuilder()
                  .setTitle("✅ Sin advertencias")
                  .setDescription(`${user} no tenía advertencias.`)
                  .setColor("Green")
              ],
              components: []
            });
          }
		  
          return i.update({
            embeds: [
              new EmbedBuilder()
                .setTitle("🧹 Warns eliminadas")
                .setDescription(
                  `Se eliminaron **${result.affectedRows}** advertencias de ${user}.`
                )
                .setColor("Green")
                .setTimestamp()
            ],
            components: []
          });
        }

        if (i.customId === "clear_no") {
          return i.update({
            embeds: [
              new EmbedBuilder()
                .setTitle("❌ Acción cancelada")
                .setDescription(`No se eliminaron las advertencias de ${user}.`)
                .setColor("Grey")
            ],
            components: []
          });
        }
      });

      collector.on("end", async collected => {
        if (collected.size === 0) {
          await msg
            .edit({
              embeds: [
                new EmbedBuilder()
                  .setTitle("⌛ Tiempo agotado")
                  .setDescription(
                    "No se recibió confirmación, operación cancelada."
                  )
                  .setColor("Grey")
              ],
              components: []
            })
            .catch(() => {});
        }
      });
    }
  }
};

