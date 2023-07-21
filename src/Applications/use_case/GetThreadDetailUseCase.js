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
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadDetail.threadId,
      true
    );
    const replies = await this._replyRepository.getRepliesByThreadId(threadDetail.threadId, true);
    const commentsAndReplies = this._attachRepliesToComments(comments, replies);

    return {
      ...thread,
      comments: commentsAndReplies,
    };
  }

  _attachRepliesToComments(comments, replies) {
    let i = 0;
    for (const comment of comments) {
      comment.replies = [];
      while (i < replies.length && replies[i].comment_id === comment.id) {
        // eslint-disable-next-line no-param-reassign
        delete replies[i].comment_id;
        comment.replies.push(replies[i++]);
      }
    }
    return comments;
  }
}

module.exports = GetThreadDetailUseCase;
