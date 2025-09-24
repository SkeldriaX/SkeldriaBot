const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("🚫 Banea a un miembro del servidor.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName("usuario")
                .setDescription("El usuario a banear")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("razón")
                .setDescription("Motivo del baneo")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("usuario");
        const reason = interaction.options.getString("razón") || "Sin especificar";
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        // ============ Validaciones ============
        if (!member) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ Error")
                        .setDescription("El usuario no se encuentra en el servidor o ya salió.")
                        .setColor("Red")
                ],
                ephemeral: true
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ Error")
                        .setDescription("No puedes banearte a ti mismo.")
                        .setColor("Red")
                ],
                ephemeral: true
            });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ Error")
                        .setDescription("No puedes banear al dueño del servidor.")
                        .setColor("Red")
                ],
                ephemeral: true
            });
        }

        if (!member.bannable) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ Error")
                        .setDescription("No tengo permisos para banear a este usuario (probablemente su rol es más alto que el mío).")
                        .setColor("Red")
                ],
                ephemeral: true
            });
        }

        // ============ Ejecución ============
        try {
            await member.ban({ reason });

            const embedSuccess = new EmbedBuilder()
                .setTitle("✅ Usuario baneado")
                .setDescription(`El usuario **${user.tag}** ha sido baneado.\n\n**Razón:** ${reason}`)
                .setColor("Green")
                .setTimestamp()
                .setFooter({ text: `Moderador: ${interaction.user.tag}` });

            await interaction.reply({ embeds: [embedSuccess] });
        } catch (error) {
            console.error("❌ Error al banear:", error);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("⚠️ Error inesperado")
                        .setDescription("Hubo un error al intentar banear a este usuario.")
                        .setColor("Orange")
                ],
                ephemeral: true
            });
        }
    }
};
