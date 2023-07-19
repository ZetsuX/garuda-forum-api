const CommentDelete = require("../../Domains/comments/entities/CommentDelete");

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const commentDelete = new CommentDelete(useCasePayload);
    await this._threadRepository.getThreadById(commentDelete.threadId);
    await this._commentRepository.checkComment(commentDelete.commentId, commentDelete.threadId);
    await this._commentRepository.verifyCommentOwner(commentDelete.commentId, commentDelete.owner);
    const deletedComment = await this._commentRepository.deleteCommentById(commentDelete.commentId);
    return deletedComment;
  }
}

module.exports = DeleteCommentUseCase;
