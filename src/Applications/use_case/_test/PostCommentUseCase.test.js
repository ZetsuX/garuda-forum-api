const PostedComment = require("../../../Domains/comments/entities/PostedComment");
const CommentPost = require("../../../Domains/comments/entities/CommentPost");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const PostCommentUseCase = require("../PostCommentUseCase");

describe("PostCommentUseCase", () => {
  it("should orchestrate the post comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "content comment",
      owner: "user-123",
      threadId: "thread-123",
    };
    const expectedPostedComment = new PostedComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner: "user-123",
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockCommentRepository.postComment = jest.fn(() =>
      Promise.resolve(
        new PostedComment({
          id: "comment-123",
          content: useCasePayload.content,
          owner: "user-123",
        })
      )
    );
    mockThreadRepository.checkThread = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const postCommentUseCase = new PostCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const postedComment = await postCommentUseCase.execute(useCasePayload);

    // Assert
    expect(postedComment).toStrictEqual(expectedPostedComment);
    expect(mockCommentRepository.postComment).toBeCalledWith(
      new CommentPost({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        threadId: useCasePayload.threadId,
      })
    );
    expect(mockThreadRepository.checkThread).toBeCalledWith(useCasePayload.threadId);
  });
});
