const ReplyDelete = require("../ReplyDelete");

describe("a ReplyDelete entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      replyId: "reply-123",
      commentId: "comment-123",
      threadId: "thread-123",
    };

    // Action and Assert
    expect(() => new ReplyDelete(payload)).toThrowError("REPLY_DELETE.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      replyId: 123,
      commentId: 123,
      threadId: true,
      owner: "a",
    };

    // Action and Assert
    expect(() => new ReplyDelete(payload)).toThrowError(
      "REPLY_DELETE.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create commentDelete object correctly", () => {
    // Arrange
    const payload = {
      replyId: "reply-123",
      commentId: "comment-123",
      threadId: "thread-123",
      owner: "user-123",
    };

    // Action
    const { replyId, commentId, threadId, owner } = new ReplyDelete(payload);

    // Assert
    expect(replyId).toEqual(payload.replyId);
    expect(commentId).toEqual(payload.commentId);
    expect(threadId).toEqual(payload.threadId);
    expect(owner).toEqual(payload.owner);
  });
});
