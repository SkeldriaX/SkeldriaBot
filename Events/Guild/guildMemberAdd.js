const updateCounters = require("../Client/updateCounters");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    await updateCounters(member.guild, member.client.db);
  }
};
