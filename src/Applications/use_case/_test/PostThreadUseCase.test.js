const PostedThread = require("../../../Domains/threads/entities/PostedThread");
const ThreadPost = require("../../../Domains/threads/entities/ThreadPost");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const PostThreadUseCase = require("../PostThreadUseCase");

describe("PostThreadUseCase", () => {
  it("should orchestrate the post thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "ttitle",
      body: "tbody",
      owner: "user-123",
    };
    const expectedPostedThread = new PostedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: "user-123",
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.postThread = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new PostedThread({
          id: "thread-123",
          title: useCasePayload.title,
          owner: "user-123",
        })
      )
    );

    /** creating use case instance */
    const postThreadUseCase = new PostThreadUseCase({ threadRepository: mockThreadRepository });

    // Action
    const postedThread = await postThreadUseCase.execute(useCasePayload);

    // Assert
    expect(postedThread).toStrictEqual(expectedPostedThread);
    expect(mockThreadRepository.postThread).toBeCalledWith(
      new ThreadPost({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      })
    );
  });
});
