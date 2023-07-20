const PostedReply = require("../../Domains/replies/entities/PostedReply");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async postReply(postReply) {
    const { content, owner, commentId } = postReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, owner, commentId, false, date],
    };

    const result = await this._pool.query(query);
    return new PostedReply({ ...result.rows[0] });
  }

  async checkReply(replyId, commentId) {
    const query = {
      text: "SELECT comment_id FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount || result.rows[0].comment_id !== commentId) {
      throw new NotFoundError("reply tidak ditemukan");
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1 AND owner = $2",
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("tidak dapat mengakses resource ini");
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: "UPDATE replies SET is_deleted = true WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("reply tidak ditemukan");
    }
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
        SELECT replies.id, users.username, replies.date, replies.content, replies.is_deleted, replies.comment_id
        FROM replies
        INNER JOIN users ON replies.owner = users.id
        WHERE replies.comment_id = $1
        ORDER BY replies.date ASC
      `,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
