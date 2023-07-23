const MarkedComments = require("../MarkedComments");

describe("a MarkedComments entities", () => {
  it("should mark the passed comments correctly", () => {
    // Arrange
    const payload = [
      {
        id: "comment-123",
        username: "uname",
        date: "2021-08-08T07:26:21.338Z",
        content: "isi comment",
        is_deleted: true,
      },

      {
        id: "comment-124",
        username: "uname2",
        date: "2021-08-08T09:28:11.338Z",
        content: "isi comment2",
        is_deleted: false,
      },
    ];

    // Action
    const markedComments = new MarkedComments(payload).returnMarked();

    // Assert
    expect(markedComments).toBeDefined();
    expect(markedComments).toHaveLength(2);
    expect(markedComments[0].id).toEqual(payload[0].id);
    expect(markedComments[0].username).toEqual(payload[0].username);
    expect(markedComments[0].date).toEqual(payload[0].date);
    expect(markedComments[0].content).toEqual("**komentar telah dihapus**");
    expect(markedComments[0].is_deleted).toBeUndefined();
    expect(markedComments[1].id).toEqual(payload[1].id);
    expect(markedComments[1].username).toEqual(payload[1].username);
    expect(markedComments[1].date).toEqual(payload[1].date);
    expect(markedComments[1].content).toEqual(payload[1].content);
    expect(markedComments[1].is_deleted).toBeUndefined();
  });
});
