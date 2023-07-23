const ThreadDetail = require("../../Domains/threads/entities/ThreadDetail");
const MarkedComments = require("../../Domains/comments/entities/MarkedComments");
const MarkedReply = require("../../Domains/replies/entities/MarkedReply");

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const threadDetail = new ThreadDetail(useCasePayload);
    const thread = await this._threadRepository.getThreadById(threadDetail.threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadDetail.threadId,
      true
    );
    const replies = await this._replyRepository.getRepliesByThreadId(threadDetail.threadId, true);
    const likeCounts = await this._likeRepository.getLikeCountsByThreadId(threadDetail.threadId);

    const finalComments = this._finalizeComments(
      new MarkedComments(comments).returnMarked(),
      replies,
      likeCounts
    );

    return {
      ...thread,
      comments: finalComments,
    };
  }

  _finalizeComments(comments, replies, likeCounts) {
    let i = 0;
    let j = 0;
    for (const comment of comments) {
      comment.replies = [];
      comment.likeCount = Number(likeCounts[j++].like_count);
      while (i < replies.length && replies[i].comment_id === comment.id) {
        comment.replies.push(new MarkedReply(replies[i++]).returnMarked());
      }
    }
    return comments;
  }
}

module.exports = GetThreadDetailUseCase;
