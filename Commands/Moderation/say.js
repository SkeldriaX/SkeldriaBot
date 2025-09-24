const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("🗣️ Haz que el bot envíe un mensaje o embed")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addStringOption(option =>
      option.setName("mensaje")
        .setDescription("El mensaje que enviará el bot (si no usas embed)")
        .setRequired(true)
    )

    .addStringOption(option =>
      option.setName("titulo")
        .setDescription("Título del embed")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("descripcion")
        .setDescription("Descripción del embed")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("color")
        .setDescription("Color HEX del embed (#ff0000)")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("footer")
        .setDescription("Texto del footer")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("footericon")
        .setDescription("URL del icono del footer")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("thumbnail")
        .setDescription("URL de la miniatura (thumbnail)")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("imagen")
        .setDescription("URL de la imagen grande")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("autor")
        .setDescription("Texto del autor")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("autoricon")
        .setDescription("URL del icono del autor")
        .setRequired(false)
    ),

  async execute(interaction) {
    const mensaje = interaction.options.getString("mensaje");

    const titulo = interaction.options.getString("titulo");
    const descripcion = interaction.options.getString("descripcion");
    const color = interaction.options.getString("color") || "#2b2d31";
    const footer = interaction.options.getString("footer");
    const footerIcon = interaction.options.getString("footericon");
    const thumbnail = interaction.options.getString("thumbnail");
    const imagen = interaction.options.getString("imagen");
    const autor = interaction.options.getString("autor");
    const autorIcon = interaction.options.getString("autoricon");

    try {
      if (titulo || descripcion || footer || thumbnail || imagen || autor) {
        const embed = new EmbedBuilder();

        if (titulo) embed.setTitle(titulo);
        if (descripcion) embed.setDescription(descripcion);
        if (color) embed.setColor(color);
        if (footer) embed.setFooter({ text: footer, iconURL: footerIcon || null });
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (imagen) embed.setImage(imagen);
        if (autor) embed.setAuthor({ name: autor, iconURL: autorIcon || null });

        await interaction.channel.send({ embeds: [embed] });
      } else if (mensaje) {
        await interaction.channel.send(mensaje);
      } else {
        return interaction.reply({
          content: "⚠️ Debes especificar al menos un **mensaje** o algún campo de embed.",
          ephemeral: true
        });
      }

      await interaction.reply({
        content: "✅ Mensaje enviado correctamente.",
        ephemeral: true
      });
    } catch (error) {
      console.error("❌ Error en /say:", error);
      return interaction.reply({
        content: "⚠️ Hubo un error al intentar enviar el mensaje.",
        ephemeral: true
      });
    }
  }
};
