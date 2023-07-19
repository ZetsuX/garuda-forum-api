const ReplyPost = require("../../Domains/replies/entities/ReplyPost");

class PostReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const replyPost = new ReplyPost(useCasePayload);
    await this._threadRepository.getThreadById(replyPost.threadId);
    await this._commentRepository.checkComment(replyPost.commentId, replyPost.threadId);
    const postedReply = await this._replyRepository.postReply(replyPost);
    return postedReply;
  }
}

module.exports = PostReplyUseCase;
