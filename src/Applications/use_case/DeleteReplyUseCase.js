const ReplyDelete = require("../../Domains/replies/entities/ReplyDelete");

class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const replyDelete = new ReplyDelete(useCasePayload);
    await this._threadRepository.checkThread(replyDelete.threadId);
    await this._commentRepository.checkComment(replyDelete.commentId, replyDelete.threadId);
    await this._replyRepository.checkReply(replyDelete.replyId, replyDelete.commentId);
    await this._replyRepository.verifyReplyOwner(replyDelete.replyId, replyDelete.owner);
    const deletedReply = await this._replyRepository.deleteReplyById(replyDelete.replyId);
    return deletedReply;
  }
}

module.exports = DeleteReplyUseCase;
