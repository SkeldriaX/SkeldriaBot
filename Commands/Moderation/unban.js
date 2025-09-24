const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("🔓 Desbanea a un usuario por su ID")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName("usuario")
                .setDescription("Ingresa el ID del usuario a desbanear")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("razon")
                .setDescription("Motivo del desbaneo")
                .setRequired(false)
        ),

    async execute(interaction) {
        const userId = interaction.options.getString("usuario");
        const reason = interaction.options.getString("razon") || "Sin especificar";

        const embed = new EmbedBuilder();

        try {
            if (!/^\d+$/.test(userId)) {
                return interaction.reply({
                    embeds: [
                        embed
                            .setTitle("❌ Error")
                            .setDescription("El ID proporcionado no es válido. Debe ser numérico.")
                            .setColor("Red")
                            .setTimestamp()
                    ],
                    ephemeral: true
                });
            }

            const unbannedUser = await interaction.guild.members.unban(userId, reason);

            embed
                .setTitle("✅ Usuario desbaneado")
                .setDescription(
                    `El usuario **${unbannedUser.tag || userId}** ha sido desbaneado.\n\n` +
                    `👤 ID: \`${userId}\`\n` +
                    `📌 Razón: ${reason}\n` +
                    `👮‍♂️ Moderador: ${interaction.user.tag}`
                )
                .setColor("Green")
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("❌ Error en /unban:", error);

            embed
                .setTitle("❌ Error al desbanear")
                .setDescription(
                    `No se pudo desbanear al ID **${userId}**.\n` +
                    `Posibles causas:\n` +
                    `- El usuario no está baneado.\n` +
                    `- El ID no corresponde a un usuario válido.\n` +
                    `- El bot no tiene permisos suficientes.`
                )
                .setColor("Red")
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};
