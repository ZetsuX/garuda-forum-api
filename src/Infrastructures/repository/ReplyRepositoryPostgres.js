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

    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, owner, commentId, false],
    };

    const result = await this._pool.query(query);
    return new PostedReply(result.rows[0]);
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

  async getRepliesByThreadId(threadId, markDeleted = false) {
    const query = {
      text: `
        SELECT rp.id, us.username, rp.date, rp.content, rp.is_deleted, rp.comment_id
        FROM replies rp
        INNER JOIN comments cm ON cm.id = rp.comment_id
        INNER JOIN users us ON us.id = rp.owner
        WHERE cm.thread_id = $1
        ORDER BY cm.date ASC, rp.comment_id ASC, rp.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    const replies = result.rows;

    if (markDeleted) {
      for (const reply of replies) {
        if (reply.is_deleted) {
          reply.content = "**balasan telah dihapus**";
        }
        delete reply.is_deleted;
      }
    }
    return replies;
  }
}

module.exports = ReplyRepositoryPostgres;
