const DeleteReplyUseCase = require("../DeleteReplyUseCase");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("DeleteReplyUseCase", () => {
  it("should orchestrate deletion of a reply correctly", async () => {
    // Arrange
    const useCasePayload = {
      replyId: "reply-123",
      commentId: "comment-123",
      threadId: "thread-123",
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkComment = jest.fn(() => Promise.resolve());
    mockReplyRepository.checkReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.threadId
    );
    expect(mockReplyRepository.checkReply).toBeCalledWith(
      useCasePayload.replyId,
      useCasePayload.commentId
    );
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(
      useCasePayload.replyId,
      useCasePayload.owner
    );
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(useCasePayload.replyId);
  });
});
