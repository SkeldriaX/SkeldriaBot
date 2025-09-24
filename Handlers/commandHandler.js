const fs = require("fs");
const path = require("path");
const ascii = require("ascii-table");
require("colors");

function loadCommands(client) {
    const basePath = path.join(__dirname, "../Commands");
    const folders = fs.readdirSync(basePath);

    const commandsArray = [];

    for (const folder of folders) {
        const folderPath = path.join(basePath, folder);
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

        const table = new ascii().setHeading(`📂 ${folder}(${files.length})`, "Estado");

        for (const file of files) {
            const filePath = path.join(folderPath, file);

            try {
                const commandFile = require(filePath);

                if (!commandFile?.data?.name) {
                    console.error(`⚠️  ${file.yellow} en carpeta ${folder.red} no tiene un objeto de comando válido.`);
                    table.addRow(file, "⚠️");
                    continue;
                }

                const properties = { folder, ...commandFile };
                client.commands.set(commandFile.data.name, properties);
                commandsArray.push(commandFile.data.toJSON());

                table.addRow(file.replace(".js", "").green, "✅");
            } catch (err) {
                console.error(`❌ Error cargando ${file.red}:`, err);
                table.addRow(file, "❌");
            }
        }

        console.log("\n" + table.toString());
    }

    client.application.commands.set(commandsArray)
        .then(() => console.log("\n✅ Todos los comandos fueron cargados correctamente.\n".blue))
        .catch(err => console.error("❌ Error registrando comandos:", err));
}

module.exports = { loadCommands };