const MarkedReply = require("../MarkedReply");

describe("a MarkedReply entities", () => {
  it("should mark the passed replies correctly if is_deleted is true", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "uname",
      date: "2021-08-08T07:26:21.338Z",
      content: "isi reply",
      is_deleted: false,
      comment_id: "comment-123",
    };

    // Action
    const markedReplies = new MarkedReply(payload).returnMarked();

    // Assert
    expect(markedReplies).toBeDefined();
    expect(markedReplies.id).toEqual(payload.id);
    expect(markedReplies.username).toEqual(payload.username);
    expect(markedReplies.date).toEqual(payload.date);
    expect(markedReplies.content).toEqual(payload.content);
    expect(markedReplies.comment_id).toBeUndefined();
    expect(markedReplies.is_deleted).toBeUndefined();
  });

  it("should mark the passed replies correctly if is_deleted is true", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      username: "uname",
      date: "2021-08-08T07:26:21.338Z",
      content: "isi reply",
      is_deleted: true,
      comment_id: "comment-123",
    };

    // Action
    const markedReplies = new MarkedReply(payload).returnMarked();

    // Assert
    expect(markedReplies).toBeDefined();
    expect(markedReplies.id).toEqual(payload.id);
    expect(markedReplies.username).toEqual(payload.username);
    expect(markedReplies.date).toEqual(payload.date);
    expect(markedReplies.content).toEqual("**balasan telah dihapus**");
    expect(markedReplies.comment_id).toBeUndefined();
    expect(markedReplies.is_deleted).toBeUndefined();
  });
});
