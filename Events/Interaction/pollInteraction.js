module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    // Verificar si el botón pertenece a una encuesta
    if (!interaction.customId.startsWith("vote_")) return;

    const pollCmd = client.commands.get("poll");
    if (pollCmd && pollCmd.buttonHandler) {
      try {
        await pollCmd.buttonHandler(interaction, client);
      } catch (error) {
        console.error("❌ Error en pollInteraction:", error);
        await interaction.reply({
          content: "❌ Hubo un error al procesar tu voto.",
          ephemeral: true,
        });
      }
    }
  },
};
