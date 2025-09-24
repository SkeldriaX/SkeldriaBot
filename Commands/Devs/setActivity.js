const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActivityType 
} = require("discord.js");
const emoji = require("../../emojis.json");
const { developers } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setactivity")
    .setDescription("⚙️ Establece la actividad y el estado del bot")
    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de actividad (playing, watching, listening, streaming)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("actividad")
        .setDescription("Nombre de la actividad")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("estado")
        .setDescription("Estado del bot (online, idle, dnd, invisible)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL de streaming (solo para 'streaming')")
        .setRequired(false)
    ),

  async execute(interaction) {
    // Verificar si el usuario está en la lista de developers
    if (!devs.includes(interaction.user.id)) {
      return interaction.reply({
        content: `${emoji.cross || "❌"} | Solo los desarrolladores pueden usar este comando.`,
        ephemeral: true
      });
    }

    const type = interaction.options.getString("tipo").toLowerCase();
    const activity = interaction.options.getString("actividad");
    const status = interaction.options.getString("estado").toLowerCase();
    const url = interaction.options.getString("url");

    // Mapear string a ActivityType
    const typeMap = {
      playing: ActivityType.Playing,
      watching: ActivityType.Watching,
      listening: ActivityType.Listening,
      streaming: ActivityType.Streaming
    };

    if (!typeMap[type]) {
      return interaction.reply({
        content: `${emoji.cross || "❌"} | Tipo de actividad no válido. Usa: ${Object.keys(typeMap).join(", ")}`,
        ephemeral: true
      });
    }

    const statusOptions = ["online", "idle", "dnd", "invisible"];
    if (!statusOptions.includes(status)) {
      return interaction.reply({
        content: `${emoji.cross || "❌"} | Estado no válido. Usa: ${statusOptions.join(", ")}`,
        ephemeral: true
      });
    }

    if (type === "streaming" && !url) {
      return interaction.reply({
        content: `${emoji.warn || "⚠️"} | Debes proporcionar una URL válida de Twitch/YouTube para el estado de streaming.`,
        ephemeral: true
      });
    }

    try {
      await interaction.client.user.setActivity({
        name: activity,
        type: typeMap[type],
        url: type === "streaming" ? url : undefined
      });
      await interaction.client.user.setStatus(status);

      const embed = new EmbedBuilder()
        .setTitle(`${emoji.success || "✅"} Actividad y estado actualizados`)
        .addFields(
          { name: "🎮 Actividad", value: activity, inline: true },
          { name: "📌 Tipo", value: type, inline: true },
          { name: "🌐 Estado", value: status, inline: true },
          ...(type === "streaming" ? [{ name: "🔗 URL", value: url }] : [])
        )
        .setColor(0x00ff00)
        .setFooter({
          text: `Configurado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("❌ Error al establecer actividad/estado:", error);
      interaction.reply({
        content: "❌ Ocurrió un error al establecer la actividad o estado del bot.",
        ephemeral: true
      });
    }
  }
};
