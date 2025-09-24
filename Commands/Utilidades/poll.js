const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const polls = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Crea una encuesta con múltiples opciones (mínimo 2).")
    .addStringOption((option) =>
      option.setName("pregunta")
        .setDescription("La pregunta de la encuesta")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("opcion1")
        .setDescription("Primera opción")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("opcion2")
        .setDescription("Segunda opción")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("opcion3")
        .setDescription("Tercera opción")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("opcion4")
        .setDescription("Cuarta opción")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("opcion5")
        .setDescription("Quinta opción")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("opcion6")
        .setDescription("Sexta opción")
        .setRequired(false)
    ),

  async execute(interaction) {
    const pregunta = interaction.options.getString("pregunta");

    // Recoger todas las opciones
    const opciones = [];
    for (let i = 1; i <= 6; i++) {
      const opcion = interaction.options.getString(`opcion${i}`);
      if (opcion) opciones.push(opcion);
    }

    if (opciones.length < 2) {
      return interaction.reply({
        content: "❌ Debes proporcionar al menos **2 opciones**.",
        ephemeral: true,
      });
    }

    // Crear embed inicial
    let descripcion = `**${pregunta}**\n\n`;
    opciones.forEach((op, index) => {
      const emoji = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣"][index] || "🔘";
      descripcion += `${emoji} ${op}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("📊 Encuesta")
      .setDescription(descripcion)
      .setColor("Aqua")
      .setFooter({
        text: `Encuesta creada por ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // Crear filas de botones (Discord permite máx 5 por fila)
    const rows = [];
    let currentRow = new ActionRowBuilder();
    opciones.forEach((op, index) => {
      if (index > 0 && index % 5 === 0) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`vote_${index}`)
          .setLabel(op)
          .setStyle(ButtonStyle.Primary)
      );
    });
    rows.push(currentRow);

    // Enviar encuesta
    const message = await interaction.reply({
      embeds: [embed],
      components: rows,
      fetchReply: true,
    });

    // Guardar votos
    polls.set(message.id, {
      pregunta,
      opciones,
      votos: Array(opciones.length).fill().map(() => new Set())
    });
  },

  async buttonHandler(interaction) {
    const poll = polls.get(interaction.message.id);
    if (!poll) return;

    const userId = interaction.user.id;
    const index = parseInt(interaction.customId.split("_")[1], 10);

    // Eliminar voto previo
    poll.votos.forEach(set => set.delete(userId));

    // Agregar nuevo voto
    poll.votos[index].add(userId);

    // Construir descripción actualizada
    let descripcion = `**${poll.pregunta}**\n\n`;
    poll.opciones.forEach((op, i) => {
      const emoji = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣"][i] || "🔘";
      descripcion += `${emoji} ${op} — ${poll.votos[i].size} votos\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("📊 Encuesta")
      .setDescription(descripcion)
      .setColor("Aqua")
      .setFooter({
        text: `Encuesta creada por ${interaction.message.interaction.user.username}`,
        iconURL: interaction.message.interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.update({ embeds: [embed], components: interaction.message.components });
    await interaction.followUp({
      content: `✅ Tu voto fue registrado: **${poll.opciones[index]}**`,
      ephemeral: true,
    });
  },
};
