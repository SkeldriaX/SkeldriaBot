const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const config = require("./config/config.json");
const emoji = require("./config/emojis.json");
const tsconfig = require("./Tickets/tsconfig.json");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Handlers
const { loadEvents } = require("./Handlers/eventHandler");
const { loadCommands } = require("./Handlers/commandHandler");

// ====================== VALIDACIONES ======================
if (!process.env.TOKEN) {
    console.error("❌ No se encontró un TOKEN en el archivo .env");
    process.exit(1);
}

// ====================== CLIENTE ======================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.User
    ]
});

client.commands = new Collection();

// ====================== DATABASE ======================
const pool = require("./Handlers/db");
client.db = pool;

// ====================== BOT MENTION ======================
client.on("messageCreate", (message) => {
    if (message.author.bot || !message.guild) return;

    const regex = new RegExp(`^<@!?${client.user?.id}>$`);
    if (regex.test(message.content)) {
        const embed = new EmbedBuilder()
            .setTitle(`¡Hola! ${emoji.logo || "🤖"}`)
            .setDescription(
                `Soy el bot oficial de **${message.guild.name}** 🚀\n\n` +
                `Usa **\`/ayuda\`** para ver mis comandos disponibles.`
            )
            .setColor(config.color || "#ff0000")
            .setFooter({ text: `ID: ${client.user?.id}` })
            .setTimestamp();

        message.reply({ embeds: [embed] }).catch(() => {});
    }
});

// ====================== TRANSCRIPCIONES ======================
const transcriptsPath = path.join(__dirname, "Tickets", "transcripts");
if (!fs.existsSync(transcriptsPath)) {
    fs.mkdirSync(transcriptsPath, { recursive: true });
}

client.generateTranscript = async function (channel) {
    const messages = await channel.messages.fetch({ limit: 100 });

    const transcriptHtml = `
    <html>
      <head>
        <title>Transcript - ${channel.name}</title>
        <link rel="stylesheet" href="../style.css">
      </head>
      <body>
        <div class="container">
          <h2>Transcript de #${channel.name}</h2>
          ${messages.reverse().map(m => `
            <div class="message">
              <span class="timestamp">[${m.createdAt.toLocaleString()}]</span>
              <span class="username">${m.author.tag}</span>:
              <span class="content">${m.content || "<i>Mensaje vacío / embed</i>"}</span>
            </div>
          `).join("")}
        </div>
      </body>
    </html>`;

    const filePath = path.join(transcriptsPath, `${channel.id}.html`);
    fs.writeFileSync(filePath, transcriptHtml);

    const url = `${config.tsdomain}/transcripciones/${channel.id}.html`;

    // Enviar al canal de logs configurado en tsconfig.json
    try {
        const logChannel = await channel.guild.channels.fetch(tsconfig.tschannel);
        if (logChannel) {
            logChannel.send(`📝 Nueva transcripción generada para **#${channel.name}**: ${url}`);
        }
    } catch (err) {
        console.error("❌ Error enviando transcripción al canal de logs:", err);
    }

    return url;
};

// ====================== SERVIDOR EXPRESS ======================
const express = require("express");
const app = express();
app.use("/transcripciones", express.static(transcriptsPath));

const PORT = process.env.PORT || 2001;
app.listen(PORT, () => {
    console.log(`🌐 Servidor de transcripciones activo en http://localhost:${PORT}/transcripciones`);
});

// ====================== INICIO ======================
(async () => {
    try {
        // Conectar login primero
        await client.login(process.env.TOKEN);

        // Crear tablas de DB antes de cargar eventos/comandos
        const dbPath = path.join(__dirname, "Events", "Database");
        if (fs.existsSync(dbPath)) {
            for (const file of fs.readdirSync(dbPath).filter(f => f.endsWith(".js"))) {
                try {
                    const initTable = require(path.join(dbPath, file));
                    if (typeof initTable === "function") {
                        await initTable(pool);
                        console.log(`✅ [DB] Tabla iniciada desde: ${file}`);
                    }
                } catch (err) {
                    console.error(`❌ [DB] Error en ${file}:`, err);
                }
            }
        }

        // Cargar handlers
        loadEvents(client);
        loadCommands(client);

        console.log(`✅ Bot iniciado como ${client.user.tag}`);
    } catch (err) {
        console.error("❌ Error al iniciar el bot:", err);
        process.exit(1);
    }
})();
