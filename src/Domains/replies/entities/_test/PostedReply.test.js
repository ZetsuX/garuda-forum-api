const PostedReply = require("../PostedReply");

describe("a PostedReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      content: "HAHAHS",
      owner: "user-123",
    };

    // Action and Assert
    expect(() => new PostedReply(payload)).toThrowError("POSTED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: "a",
      content: true,
      owner: 123,
    };

    // Action and Assert
    expect(() => new PostedReply(payload)).toThrowError(
      "POSTED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create postedReply object correctly", () => {
    // Arrange
    const payload = {
      id: "reply-h_W1Plfpj0TY7wyT2PUPX",
      content: "isi reply",
      owner: "user-DWrT3pXe1hccYkV1eIAxS",
    };

    // Action
    const postedReply = new PostedReply(payload);

    // Assert
    expect(postedReply.id).toEqual(payload.id);
    expect(postedReply.content).toEqual(payload.content);
    expect(postedReply.owner).toEqual(payload.owner);
  });
});
