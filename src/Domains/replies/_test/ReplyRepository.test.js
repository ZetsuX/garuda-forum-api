const ReplyRepository = require("../ReplyRepository");

describe("ReplyRepository", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const commentRepository = new ReplyRepository();

    // Action and Assert
    await expect(commentRepository.postReply({})).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentRepository.checkReply({})).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentRepository.verifyReplyOwner({})).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentRepository.deleteReplyById("")).rejects.toThrowError(
      "REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
