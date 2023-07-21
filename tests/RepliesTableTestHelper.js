/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
  async addReply({
    id = "reply-123",
    content = "content reply",
    owner = "user-123",
    commentId = "comment-123",
    isDeleted = false,
    date = "2021-08-08T07:26:21.338Z",
  }) {
    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)",
      values: [id, content, owner, commentId, isDeleted, date],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM replies");
  },
};

module.exports = RepliesTableTestHelper;
