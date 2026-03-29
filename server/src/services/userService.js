const User = require('../models/User');

const findOrCreateUser = async (identifier) => {
  if (!identifier) {
    throw new Error('User identifier is required.');
  }

  const cleanIdentifier = String(identifier).trim();
  return User.findOneAndUpdate(
    { identifier: cleanIdentifier },
    { $setOnInsert: { identifier: cleanIdentifier } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

module.exports = {
  findOrCreateUser,
};
