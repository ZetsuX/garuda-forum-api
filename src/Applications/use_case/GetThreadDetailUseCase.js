const ThreadDetail = require("../../Domains/threads/entities/ThreadDetail");

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const threadDetail = new ThreadDetail(useCasePayload);
    const thread = await this._threadRepository.getThreadById(threadDetail.threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadDetail.threadId);
    const commentsAndReplies = await this._attachReplies(comments);

    const finalComments = this._markDeleted(commentsAndReplies);
    return {
      ...thread,
      comments: finalComments,
    };
  }

  _markDeleted(entities, isComment = true) {
    for (const entity of entities) {
      if (entity.is_deleted) {
        entity.content = `**${isComment ? "komentar" : "balasan"} telah dihapus**`;
      }
      delete entity.is_deleted;
    }
    return entities;
  }

  _removeCommentIdFromReplies(replies) {
    for (const reply of replies) delete reply.comment_id;
    return replies;
  }

  async _attachReplies(comments) {
    for (const comment of comments) {
      // eslint-disable-next-line no-await-in-loop
      const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
      const markedReplies = this._markDeleted(replies, false);
      const finalReplies = this._removeCommentIdFromReplies(markedReplies);
      comment.replies = finalReplies;
    }
    return comments;
  }
}

module.exports = GetThreadDetailUseCase;
