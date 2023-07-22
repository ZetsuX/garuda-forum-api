class LikeRepository {
  async postLike(commentId, owner) {
    throw new Error("LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async checkLike(commentId, owner) {
    throw new Error("LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async changeLikeStatus(payload) {
    throw new Error("LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getLikeCountsByThreadId(threadId) {
    throw new Error("LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = LikeRepository;
