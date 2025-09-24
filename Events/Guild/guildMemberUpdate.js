const updateCounters = require("../Client/updateCounters");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember) {
    if (oldMember.premiumSince !== newMember.premiumSince) {
      await updateCounters(newMember.guild, newMember.client.db);
    }
  }
};
