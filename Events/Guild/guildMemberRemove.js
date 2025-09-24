const updateCounters = require("../Client/updateCounters");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    await updateCounters(member.guild, member.client.db);
  }
};
