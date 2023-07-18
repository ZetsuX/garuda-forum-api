const CommentPost = require("../CommentPost");

describe("a CommentPost entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      content: "content comment",
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new CommentPost(payload)).toThrowError("COMMENT_POST.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      content: true,
      owner: 123,
      threadId: "a",
    };

    // Action and Assert
    expect(() => new CommentPost(payload)).toThrowError(
      "COMMENT_POST.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create commentPost object correctly", () => {
    // Arrange
    const payload = {
      content: "ABC DEF ghij",
      owner: "user-123",
      threadId: "thread-123",
    };

    // Action
    const { content, owner, threadId } = new CommentPost(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
  });
});
