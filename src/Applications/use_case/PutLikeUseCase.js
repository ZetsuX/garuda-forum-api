const LikePut = require("../../Domains/likes/entities/LikePut");

class PutLikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const likePut = new LikePut(useCasePayload);
    await this._threadRepository.checkThread(likePut.threadId);
    await this._commentRepository.checkComment(likePut.commentId, likePut.threadId);
    const checkLike = await this._likeRepository.checkLike(likePut.commentId, likePut.owner);
    if (!checkLike) await this._likeRepository.postLike(likePut.commentId, likePut.owner);
    else await this._likeRepository.changeLikeStatus(checkLike);
  }
}

module.exports = PutLikeUseCase;
