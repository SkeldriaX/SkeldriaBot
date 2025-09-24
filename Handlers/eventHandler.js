const fs = require("fs");
const path = require("path");
const ascii = require("ascii-table");
require("colors");

function loadEvents(client) {
    const basePath = path.join(__dirname, "../Events");
    const folders = fs.readdirSync(basePath);

    for (const folder of folders) {
        const folderPath = path.join(basePath, folder);
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

        const table = new ascii().setHeading(`📂 ${folder} (${files.length})`, "Estado");

        for (const file of files) {
            const filePath = path.join(folderPath, file);

            try {
                const event = require(filePath);

                if (!event?.name || typeof event.execute !== "function") {
                    console.error(`⚠️  ${file.yellow} en carpeta ${folder.red} no tiene un evento válido.`);
                    table.addRow(file.replace(".js", ""), "⚠️");
                    continue;
                }

                if (event.rest) {
                    if (event.once) {
                        client.rest.once(event.name, (...args) => event.execute(...args, client));
                    } else {
                        client.rest.on(event.name, (...args) => event.execute(...args, client));
                    }
                } else {
                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args, client));
                    } else {
                        client.on(event.name, (...args) => event.execute(...args, client));
                    }
                }

                table.addRow(file.replace(".js", "").green, "✅");
            } catch (err) {
                console.error(`❌ Error cargando ${file.red}:`, err);
                table.addRow(file.replace(".js", ""), "❌");
            }
        }

        console.log("\n" + table.toString());
    }

    console.log("\n✅ Todos los eventos fueron cargados correctamente.\n".blue);
}

module.exports = { loadEvents };