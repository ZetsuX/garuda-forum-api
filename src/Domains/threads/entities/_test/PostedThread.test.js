const PostedThread = require("../PostedThread");

describe("a PostedThread entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      title: "abc",
    };

    // Action and Assert
    expect(() => new PostedThread(payload)).toThrowError(
      "POSTED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      title: true,
      owner: "a",
    };

    // Action and Assert
    expect(() => new PostedThread(payload)).toThrowError(
      "POSTED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create postedThread object correctly", () => {
    // Arrange
    const payload = {
      id: "thread-h_W1Plfpj0TY7wyT2PUPX",
      title: "sebuah thread",
      owner: "user-DWrT3pXe1hccYkV1eIAxS",
    };

    // Action
    const postedThread = new PostedThread(payload);

    // Assert
    expect(postedThread.id).toEqual(payload.id);
    expect(postedThread.title).toEqual(payload.title);
    expect(postedThread.owner).toEqual(payload.owner);
  });
});
