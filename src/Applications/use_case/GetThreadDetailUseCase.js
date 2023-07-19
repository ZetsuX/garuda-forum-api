const ThreadDetail = require("../../Domains/threads/entities/ThreadDetail");

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const threadDetail = new ThreadDetail(useCasePayload);
    const thread = await this._threadRepository.getThreadById(threadDetail.threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadDetail.threadId);

    const finalComments = this._finalizeDeletedComment(comments);
    return {
      ...thread,
      comments: finalComments,
    };
  }

  _finalizeDeletedComment(comments) {
    for (const comment of comments) {
      if (comment.is_deleted) comment.content = "**komentar telah dihapus**";
      delete comment.is_deleted;
    }
    return comments;
  }
}

module.exports = GetThreadDetailUseCase;
