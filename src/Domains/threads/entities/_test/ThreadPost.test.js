const ThreadPost = require("../ThreadPost");

describe("a ThreadPost entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      title: "abc",
    };

    // Action and Assert
    expect(() => new ThreadPost(payload)).toThrowError("THREAD_POST.NOT_CONTAIN_NEEDED_PROPERTY");
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      title: 123,
      body: true,
      owner: "a",
    };

    // Action and Assert
    expect(() => new ThreadPost(payload)).toThrowError(
      "THREAD_POST.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create threadPost object correctly", () => {
    // Arrange
    const payload = {
      title: "abc",
      body: "ABC DEF ghij",
      owner: "user-123",
    };

    // Action
    const { title, body, owner } = new ThreadPost(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
