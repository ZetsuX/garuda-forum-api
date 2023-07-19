const PostedReply = require("../../../Domains/replies/entities/PostedReply");
const ReplyPost = require("../../../Domains/replies/entities/ReplyPost");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const PostReplyUseCase = require("../PostReplyUseCase");

describe("PostReplyUseCase", () => {
  it("should orchestrate the post reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "content reply",
      owner: "user-123",
      threadId: "thread-123",
      commentId: "comment-123",
    };
    const expectedPostedReply = new PostedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: "user-123",
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockReplyRepository.postReply = jest.fn().mockImplementation(() =>
      Promise.resolve(
        new PostedReply({
          id: "reply-123",
          content: useCasePayload.content,
          owner: "user-123",
        })
      )
    );
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkComment = jest.fn().mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const postReplyUseCase = new PostReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const postedReply = await postReplyUseCase.execute(useCasePayload);

    // Assert
    expect(postedReply).toStrictEqual(expectedPostedReply);
    expect(mockReplyRepository.postReply).toBeCalledWith(
      new ReplyPost({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
      })
    );
  });
});
