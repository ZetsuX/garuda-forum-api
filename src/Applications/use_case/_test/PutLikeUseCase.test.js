const LikePut = require("../../../Domains/likes/entities/LikePut");
const LikeRepository = require("../../../Domains/likes/LikeRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const PutLikeUseCase = require("../PutLikeUseCase");

describe("PutLikeUseCase", () => {
  it("should orchestrate the post like action correctly when like does not exist", async () => {
    // Arrange
    const useCasePayload = {
      owner: "user-123",
      threadId: "thread-123",
      commentId: "comment-123",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.checkThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.postLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const postLikeUseCase = new PutLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await postLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId
    );
    expect(mockLikeRepository.checkLike).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner
    );
    expect(mockLikeRepository.postLike).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner
    );
  });

  it("should orchestrate the post like action correctly when like exists", async () => {
    // Arrange
    const useCasePayload = {
      owner: "user-123",
      threadId: "thread-123",
      commentId: "comment-123",
    };

    const existingLike = {
      id: "like-123",
      is_deleted: false,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.checkThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkLike = jest.fn(() =>
      Promise.resolve({
        id: "like-123",
        is_deleted: false,
      })
    );
    mockLikeRepository.changeLikeStatus = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const postLikeUseCase = new PutLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await postLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId
    );
    expect(mockLikeRepository.checkLike).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner
    );
    expect(mockLikeRepository.changeLikeStatus).toBeCalledWith(existingLike);
  });
});
