const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emoji = require('../../emojis.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timer')
        .setDescription('Establece un temporizador.')
        .addStringOption(option =>
            option.setName('tiempo')
                .setDescription('Ejemplo: 10s, 5m, 2h, 1d o combinaciones como 1h30m')
                .setRequired(true)
        ),

    async execute(interaction) {
        const timeInput = interaction.options.getString('tiempo').toLowerCase();
        const user = interaction.user;

        const regex = /(\d+)(s|m|h|d)/g;
        let match;
        let totalMs = 0;

        while ((match = regex.exec(timeInput)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case 's': totalMs += value * 1000; break;
                case 'm': totalMs += value * 60 * 1000; break;
                case 'h': totalMs += value * 60 * 60 * 1000; break;
                case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
            }
        }

        if (totalMs <= 0) {
            return interaction.reply({
                content: `${emoji.cross} | Formato inválido o tiempo demasiado corto. Ejemplos: \`10s\`, \`5m\`, \`1h30m\`.`,
                ephemeral: true
            });
        }

        if (totalMs > 7 * 24 * 60 * 60 * 1000) {
            return interaction.reply({
                content: `${emoji.cross} | El tiempo máximo permitido es de **7 días**.`,
                ephemeral: true
            });
        }

        // Función para formatear tiempo restante
        const formatTime = ms => {
            let totalSeconds = Math.floor(ms / 1000);
            const d = Math.floor(totalSeconds / 86400); totalSeconds %= 86400;
            const h = Math.floor(totalSeconds / 3600); totalSeconds %= 3600;
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            let parts = [];
            if (d) parts.push(`${d}d`);
            if (h) parts.push(`${h}h`);
            if (m) parts.push(`${m}m`);
            if (s) parts.push(`${s}s`);
            return parts.join(' ');
        };

        // Función para crear barra de progreso
        const createProgressBar = (total, remaining, length = 20) => {
            const progress = Math.floor(((total - remaining) / total) * length);
            return '█'.repeat(progress) + '░'.repeat(length - progress);
        };

        // Embed inicial
        const embed = new EmbedBuilder()
            .setTitle(`${emoji.timer} | Temporizador iniciado`)
            .setDescription(`Tiempo restante: **${formatTime(totalMs)}**\n[${createProgressBar(totalMs, totalMs)}]`)
            .setColor(0x00ff00)
            .setTimestamp();

        const replyMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        let remaining = totalMs;
        const interval = 15000; // actualizar cada 15 segundos

        const timer = setInterval(async () => {
            remaining -= interval;
            if (remaining <= 0) {
                clearInterval(timer);
                const doneEmbed = new EmbedBuilder()
                    .setTitle(`${emoji.timer} | Temporizador terminado`)
                    .setDescription(`<@${user.id}>, tu temporizador ha finalizado.\nTiempo: **${timeInput}**.`)
                    .setColor(0xff0000)
                    .setTimestamp();

                try {
                    await interaction.editReply({ embeds: [doneEmbed] });
                    await interaction.followUp({ content: `<@${user.id}> ¡Tu temporizador ha terminado!` });
                } catch (err) {
                    console.error("Error enviando recordatorio final:", err);
                }
                return;
            }

            // Embed actualizado
            const updateEmbed = new EmbedBuilder()
                .setTitle(`${emoji.timer} | Temporizador en curso`)
                .setDescription(`Tiempo restante: **${formatTime(remaining)}**\n[${createProgressBar(totalMs, remaining)}]`)
                .setColor(0x00ff00)
                .setTimestamp();

            try {
                await interaction.editReply({ embeds: [updateEmbed] });
            } catch (err) {
                console.error("Error actualizando temporizador:", err);
            }
        }, interval);
    }
};