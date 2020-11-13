const getUserByEmail = (email, database) => {
  for (const entry in database) {
    if (entry.email === email) {
      return true;
    }
  }
  return false;
};

module.exports = { getUserByEmail };