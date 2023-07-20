const CommentPost = require("../../Domains/comments/entities/CommentPost");

class PostCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.checkThread(useCasePayload.threadId);
    const commentPost = new CommentPost(useCasePayload);
    const postedComment = await this._commentRepository.postComment(commentPost);
    return postedComment;
  }
}

module.exports = PostCommentUseCase;
