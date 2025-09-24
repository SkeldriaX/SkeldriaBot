const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder 
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nuke")
        .setDescription("Clona y elimina el canal actual.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.channel;

        // ====================== CONFIRMACIÓN ======================
        const confirmEmbed = new EmbedBuilder()
            .setTitle("⚠️ Confirmación requerida")
            .setDescription(
                `¿Estás seguro de que quieres **nukear** el canal **#${channel.name}**?\n\n` +
                "Esto **eliminará permanentemente** el canal y creará uno nuevo con la misma configuración."
            )
            .setColor("Orange");

        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

        const filter = (i) =>
            i.user.id === interaction.user.id &&
            ["✅", "❌"].includes(i.customId);

        const row = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: "Confirmar",
                    style: 4, // Danger
                    custom_id: "✅"
                },
                {
                    type: 2,
                    label: "Cancelar",
                    style: 2, // Secondary
                    custom_id: "❌"
                }
            ]
        };

        await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 15000
        });

        collector.on("collect", async (i) => {
            if (i.customId === "❌") {
                await i.update({
                    content: "❌ Nuke cancelado.",
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
                collector.stop();
                return;
            }

            if (i.customId === "✅") {
                try {
                    const position = channel.position;
                    const newChannel = await channel.clone();

                    await newChannel.setPosition(position);

                    const nukedEmbed = new EmbedBuilder()
                        .setTitle("💣 Canal Nuked")
                        .setDescription(`Canal Nukeado.\nCanal: #${channel.name}`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `Acción realizada por ${interaction.user.tag}` });

                    await newChannel.send({ embeds: [nukedEmbed] });

                    await channel.delete();
                    collector.stop();
                } catch (error) {
                    console.error("❌ Error al nukear:", error);
                    await i.update({
                        content: "⚠️ Hubo un error al intentar nukear este canal.",
                        embeds: [],
                        components: [],
                        ephemeral: true
                    });
                }
            }
        });

        collector.on("end", async (collected) => {
            if (!collected.size) {
                await interaction.editReply({
                    content: "⌛ Tiempo de confirmación agotado. Nuke cancelado.",
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            }
        });
    }
};
