/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const UsersTableTestHelper = {
  async addUser({
    id = "user-123",
    username = "uname",
    password = "secret",
    fullname = "Full Name",
  }) {
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO users VALUES($1, $2, $3, $4, $5, $6)",
      values: [id, username, password, fullname, createdAt, createdAt],
    };

    await pool.query(query);
  },

  async findUsersById(id) {
    const query = {
      text: "SELECT * FROM users WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM users");
  },
};

module.exports = UsersTableTestHelper;
