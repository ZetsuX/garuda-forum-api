const LikeRepository = require("../LikeRepository");

describe("LikeRepository", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Action and Assert
    await expect(likeRepository.postLike("", "")).rejects.toThrowError(
      "LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(likeRepository.checkLike("", "")).rejects.toThrowError(
      "LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(likeRepository.changeLikeStatus({})).rejects.toThrowError(
      "LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(likeRepository.getLikeCountsByThreadId({})).rejects.toThrowError(
      "LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
