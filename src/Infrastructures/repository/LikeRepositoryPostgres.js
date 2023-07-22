/* eslint-disable camelcase */

const LikeRepository = require("../../Domains/likes/LikeRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async postLike(commentId, owner) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO likes VALUES($1, $2, $3) RETURNING id",
      values: [id, owner, commentId],
    };

    await this._pool.query(query);
  }

  async checkLike(commentId, owner) {
    const query = {
      text: "SELECT id, is_deleted FROM likes WHERE comment_id = $1 AND owner = $2",
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async changeLikeStatus({ id, is_deleted }) {
    const query = {
      text: "UPDATE likes SET is_deleted = $1 WHERE id = $2 RETURNING id",
      values: [!is_deleted, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("like tidak ditemukan");
    }
  }

  async getLikeCountsByThreadId(threadId) {
    const query = {
      text: `SELECT COALESCE(COUNT(lk.id), 0) as like_count, cm.id as comment_id
      FROM comments cm
      LEFT JOIN likes lk ON cm.id = lk.comment_id AND lk.is_deleted = false
      WHERE cm.thread_id = $1
      GROUP BY cm.id
      ORDER BY cm.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;
