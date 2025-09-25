const config = require('../../config/config.json');
require("colors");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            return interaction.reply({
                content: "❌ Este comando no existe o no está cargado.",
                ephemeral: true
            }).catch(() => {});
        }

        // ====================== VERIFICACIÓN SOLO DEVELOPERS ======================
        if (command.developer) {
            const developers = Array.isArray(config.devs)
                ? config.devs
                : [config.devs];

            if (!developers.includes(interaction.user.id)) {
                return interaction.reply({
                    content: "⚠️ Este comando es solo para developers.",
                    ephemeral: true
                }).catch(() => {});
            }
        }

        // ====================== VERIFICACIÓN DE PERMISOS ======================
        if (command.permissions) {
            if (!interaction.member.permissions.has(command.permissions)) {
                return interaction.reply({
                    content: `🚫 No tienes permisos para usar este comando.\nPermisos requeridos: \`${command.permissions.join(", ")}\``,
                    ephemeral: true
                }).catch(() => {});
            }
        }

        // ====================== EJECUCIÓN DEL COMANDO ======================
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`❌ Error en el comando ${interaction.commandName}:`.red, error);

            const errorMsg = {
                content: "⚠️ Hubo un error al intentar ejecutar este comando.",
                ephemeral: true
            };

            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(errorMsg).catch(() => {});
            } else {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    }
};

