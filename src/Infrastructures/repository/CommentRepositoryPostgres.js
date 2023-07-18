const PostedComment = require("../../Domains/comments/entities/PostedComment");
const CommentRepository = require("../../Domains/comments/CommentRepository");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async postComment(postComment) {
    const { content, owner, threadId } = postComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, owner, threadId, date],
    };

    const result = await this._pool.query(query);

    return new PostedComment({ ...result.rows[0] });
  }
}

module.exports = CommentRepositoryPostgres;
