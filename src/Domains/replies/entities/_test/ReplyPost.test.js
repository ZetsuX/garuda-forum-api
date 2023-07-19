const ReplyPost = require("../ReplyPost");

describe("a ReplyPost entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      content: "content reply",
      owner: "user-123",
      threadId: "thread-123",
    };

    // Action and Assert
    expect(() => new ReplyPost(payload)).toThrowError("REPLY_POST.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      content: true,
      owner: 123,
      threadId: "a",
      commentId: 12,
    };

    // Action and Assert
    expect(() => new ReplyPost(payload)).toThrowError(
      "REPLY_POST.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create replyPost object correctly", () => {
    // Arrange
    const payload = {
      content: "ABC DEF ghij",
      owner: "user-123",
      threadId: "thread-123",
      commentId: "comment-123",
    };

    // Action
    const { content, owner, threadId, commentId } = new ReplyPost(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
  });
});
