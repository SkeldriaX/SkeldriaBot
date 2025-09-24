const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("counterchannel")
    .setDescription("📊 Configura un canal contador en el servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("➕ Crear un canal contador")
        .addStringOption(opt =>
          opt.setName("tipo")
            .setDescription("Tipo de contador")
            .setRequired(true)
            .addChoices(
              { name: "👥 Total de miembros", value: "total" },
              { name: "🙍 Miembros reales", value: "users" },
              { name: "🤖 Bots", value: "bots" },
              { name: "🚀 Boosters", value: "boosters" }
            )
        )
        .addStringOption(opt =>
          opt.setName("nombre")
            .setDescription("Nombre del canal (usa {count} para el número)")
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName("canal_tipo")
            .setDescription("Tipo de canal a crear")
            .setRequired(true)
            .addChoices(
              { name: "🔊 Voice", value: "voice" },
              { name: "💬 Text", value: "text" }
            )
        )
        .addChannelOption(opt =>
          opt.setName("categoria")
            .setDescription("Categoría donde crear el canal")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("🗑️ Eliminar un canal contador")
        .addStringOption(opt =>
          opt.setName("tipo")
            .setDescription("Tipo de contador a eliminar")
            .setRequired(true)
            .addChoices(
              { name: "Total", value: "total" },
              { name: "Usuarios", value: "users" },
              { name: "Bots", value: "bots" },
              { name: "Boosters", value: "boosters" }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("view")
        .setDescription("🔎 Ver los canales contador configurados")
    ),

  async execute(interaction) {
    const db = interaction.client.db;
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    if (sub === "create") {
      const type = interaction.options.getString("tipo");
      const nameTemplate = interaction.options.getString("nombre");
      const channelType = interaction.options.getString("canal_tipo");
      const category = interaction.options.getChannel("categoria");

      // Calcular el número actual
      const count = getCount(interaction.guild, type);
      const channelName = nameTemplate.replace("{count}", count);

      // Elegir tipo de canal
      let newChannelType = ChannelType.GuildVoice;
      if (channelType === "text") newChannelType = ChannelType.GuildText;

      // Crear canal
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: newChannelType,
        parent: category ? category.id : null,
        permissionOverwrites: newChannelType === ChannelType.GuildVoice
          ? [{ id: interaction.guild.id, deny: ["Connect"] }] // voz bloqueado
          : []
      });

      // Guardar en DB
      await db.query(
        "INSERT INTO counter_channels (guildId, channelId, type, nameTemplate) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE channelId = VALUES(channelId), nameTemplate = VALUES(nameTemplate)",
        [guildId, channel.id, type, nameTemplate]
      );

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("✅ Contador creado")
            .setDescription(`Canal contador creado para **${type}** → ${channel}`)
            .setColor("Green")
            .setTimestamp()
        ]
      });
    }

    if (sub === "remove") {
      const type = interaction.options.getString("tipo");

      const [rows] = await db.query(
        "SELECT * FROM counter_channels WHERE guildId = ? AND type = ?",
        [guildId, type]
      );
      if (!rows.length) {
        return interaction.reply({ content: "❌ No hay canal contador configurado para ese tipo.", ephemeral: true });
      }

      const channel = interaction.guild.channels.cache.get(rows[0].channelId);
      if (channel) await channel.delete().catch(() => {});

      await db.query(
        "DELETE FROM counter_channels WHERE guildId = ? AND type = ?",
        [guildId, type]
      );

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🗑️ Contador eliminado")
            .setDescription(`Se eliminó el canal contador para **${type}**`)
            .setColor("Red")
            .setTimestamp()
        ]
      });
    }

    if (sub === "view") {
      const [rows] = await db.query(
        "SELECT * FROM counter_channels WHERE guildId = ?",
        [guildId]
      );

      if (!rows.length) {
        return interaction.reply({ content: "⚠️ No hay canales contador configurados.", ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle("🔎 Canales contador configurados")
        .setColor("Blue")
        .setTimestamp();

      for (const row of rows) {
        embed.addFields({
          name: row.type,
          value: `<#${row.channelId}> → \`${row.nameTemplate}\``,
          inline: false
        });
      }

      return interaction.reply({ embeds: [embed] });
    }
  }
};

// Helper para calcular conteo actual
function getCount(guild, type) {
  if (type === "total") return guild.memberCount;
  if (type === "users") return guild.members.cache.filter(m => !m.user.bot).size;
  if (type === "bots") return guild.members.cache.filter(m => m.user.bot).size;
  if (type === "boosters") return guild.premiumSubscriptionCount || 0;
  return 0;
}
