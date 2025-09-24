const { Events, EmbedBuilder } = require("discord.js");
const emoji = require("../../emojis.json");
const config = require("../../config.json");

// Configuración
const TIME_WINDOW_MS = 5000;
const MAX_MESSAGES = 10;
const MAX_ACTIONS = 5;

// Trackers por servidor
const messageTracker = new Map();
const actionTracker = new Map();

// Función genérica para detección de raids
async function handleRaid(client, guild, type, count) {
    try {
        const supGuild = client.guilds.cache.get(config.supGuild);
        const supChannel = supGuild?.channels.cache.get(config.supChannel);

        const embed = new EmbedBuilder()
            .setTitle("⚠️ Protección Anti-Raid Activada")
            .setDescription(
                `${emoji.blocked || "🚫"} | El bot detectó actividad sospechosa en **${guild.name}** (\`${guild.id}\`).\n\n` +
                `🔎 Tipo de evento: **${type}**\n` +
                `📊 Acciones en ${TIME_WINDOW_MS / 1000}s: **${count}**\n\n` +
                `${emoji.leave || "👋"} | El bot ha decidido **abandonar este servidor** para protegerlo.`
            )
            .setColor("Red")
            .setTimestamp();

        // Enviar aviso al servidor de soporte
        if (supChannel) {
            await supChannel.send({ embeds: [embed] });
        }

        // Avisar al owner del servidor por MD
        const owner = await guild.fetchOwner().catch(() => null);
        if (owner) {
            await owner.send({
                content: `⚠️ El bot detectó un raid en tu servidor **${guild.name}**.`,
                embeds: [embed]
            }).catch(() => {
                console.warn(`[AntiRaid] No se pudo enviar DM al owner de ${guild.name}`);
            });
        }

        // Salir del servidor donde ocurrió el raid
        await guild.leave();
        console.log(`[AntiRaid] El bot abandonó ${guild.name} (${guild.id}) por actividad sospechosa (${type}).`);
    } catch (err) {
        console.error("❌ Error al ejecutar anti-raid:", err);
    } finally {
        actionTracker.delete(guild.id);
        messageTracker.delete(guild.id);
    }
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (!message.guild) return;
        if (message.author.bot) return;

        const guildId = message.guild.id;
        if (!messageTracker.has(guildId)) {
            messageTracker.set(guildId, { count: 0, timer: null });
        }

        const tracker = messageTracker.get(guildId);
        tracker.count++;

        if (!tracker.timer) {
            tracker.timer = setTimeout(() => {
                tracker.count = 0;
                tracker.timer = null;
            }, TIME_WINDOW_MS);
        }

        if (tracker.count > MAX_MESSAGES) {
            await handleRaid(client, message.guild, "Spam de mensajes", tracker.count);
        }
    },
};

// ================== OTROS EVENTOS ==================
module.exports.extraEvents = (client) => {
    const types = {
        channelCreate: "Creación de canales",
        channelDelete: "Borrado de canales",
        roleCreate: "Creación de roles",
        roleDelete: "Borrado de roles",
        guildBanAdd: "Baneo de miembros",
        guildMemberRemove: "Expulsión de miembros"
    };

    for (const [event, label] of Object.entries(types)) {
        client.on(event, async (obj) => {
            const guild = obj.guild || obj; // algunos eventos devuelven diferente
            const guildId = guild.id;

            if (!actionTracker.has(guildId)) {
                actionTracker.set(guildId, { count: 0, timer: null });
            }

            const tracker = actionTracker.get(guildId);
            tracker.count++;

            if (!tracker.timer) {
                tracker.timer = setTimeout(() => {
                    tracker.count = 0;
                    tracker.timer = null;
                }, TIME_WINDOW_MS);
            }

            if (tracker.count > MAX_ACTIONS) {
                await handleRaid(client, guild, label, tracker.count);
            }
        });
    }
};
