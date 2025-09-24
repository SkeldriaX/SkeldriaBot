const config = require("../../config.json");
require("colors");
const { ActivityType } = require("discord.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        if (!client.user) return console.error("❌ El cliente no está listo.".red);

        console.log(`✅ Bot iniciado como ${client.user.tag}`.green);

        // ====================== CONFIG DE ESTADOS ======================
        const statuses = [
            { type: "playing", text: "AstrionMC | play.astrionmc.fun" },
            { type: "listening", text: "tus sugerencias 💡" },
            { type: "watching", text: "la seguridad del servidor 🔒" },
            { type: "competing", text: "en el top de AstrionMC 🏆" },
            { type: "watching", dynamic: () => `👥 ${client.users.cache.size} usuarios` },
            { type: "watching", dynamic: () => `🌐 ${client.guilds.cache.size} servidores` },
        ];

        const typeMap = {
            playing: ActivityType.Playing,
            listening: ActivityType.Listening,
            watching: ActivityType.Watching,
            competing: ActivityType.Competing,
            custom: ActivityType.Custom,
        };

        const setStatus = ({ type, text, dynamic }) => {
            const activityType = typeMap[type.toLowerCase()] || ActivityType.Playing;
            const statusText = dynamic ? dynamic() : text;

            client.user.setActivity({
                type: activityType,
                name: statusText,
                state: activityType === ActivityType.Custom ? statusText : undefined,
            });
        };

        // ====================== ROTACIÓN DE ESTADOS ======================
        let index = 0;
        setStatus(statuses[index]);

        setInterval(() => {
            index = (index + 1) % statuses.length;
            setStatus(statuses[index]);

            const status = client.user.presence?.status || "desconocido";
            const activity = client.user.presence?.activities?.[0]?.name || "Ninguna";

            console.log("───────────────────────────────".gray);
            console.log(`🟢 Estado actual del bot: ${status}`.blue);
            console.log(`🎮 Actividad: ${activity}`.cyan);
        }, config.statusInterval || 30000);

        // ====================== ESTADO GENERAL ======================
        client.user.setStatus(config.defaultStatus || "dnd"); 
        // opciones: "online" | "idle" | "dnd" | "invisible"
    },
};