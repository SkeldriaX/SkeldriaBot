const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("🔒 Bloquea el canal actual para que nadie pueda enviar mensajes.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addIntegerOption(option =>
            option.setName("duración")
                .setDescription("Tiempo en minutos para mantener el bloqueo (opcional)")
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.channel;
        const duration = interaction.options.getInteger("duración");

        // Validación de permisos del bot
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ Error")
                        .setDescription("No tengo permisos para administrar canales.")
                        .setColor("Red")
                ],
                ephemeral: true
            });
        }

        try {
            // Bloquear canal
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
                SendMessages: false,
            });

            const embed = new EmbedBuilder()
                .setTitle("🔒 Canal bloqueado")
                .setDescription(`El canal **#${channel.name}** ha sido bloqueado.`)
                .setColor("Red")
                .setTimestamp()
                .setFooter({ text: `Acción realizada por ${interaction.user.tag}` });

            await interaction.reply({ embeds: [embed] });

            // Si hay duración > desbloquear después de X tiempo
            if (duration && duration > 0) {
                setTimeout(async () => {
                    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
                        SendMessages: true,
                    }).catch(() => {});

                    const unlockEmbed = new EmbedBuilder()
                        .setTitle("🔓 Canal desbloqueado automáticamente")
                        .setDescription(`El canal **#${channel.name}** ha sido desbloqueado.\nBloqueado por ${duration}.`)
                        .setColor("Green")
                        .setTimestamp();

                    channel.send({ embeds: [unlockEmbed] }).catch(() => {});
                }, duration * 60 * 1000);
            }
        } catch (err) {
            console.error("❌ Error en /lock:", err);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("⚠️ Error")
                        .setDescription("Hubo un problema al intentar bloquear el canal.")
                        .setColor("Orange")
                ],
                ephemeral: true
            });
        }
    }
};
