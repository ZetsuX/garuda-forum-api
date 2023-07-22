const LikePut = require("../LikePut");

describe("a LikePut entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      owner: "user-123",
      threadId: "thread-123",
    };

    // Action and Assert
    expect(() => new LikePut(payload)).toThrowError("LIKE_PUT.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      owner: "a",
      threadId: 123,
      commentId: true,
    };

    // Action and Assert
    expect(() => new LikePut(payload)).toThrowError("LIKE_PUT.NOT_MEET_DATA_TYPE_SPECIFICATION");
  });

  it("should create likePut object correctly", () => {
    // Arrange
    const payload = {
      owner: "user-123",
      threadId: "thread-123",
      commentId: "comment-123",
    };

    // Action
    const { owner, threadId, commentId } = new LikePut(payload);

    // Assert
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
  });
});
