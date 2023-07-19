const pool = require("../../database/postgres/pool");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const ReplyPost = require("../../../Domains/replies/entities/ReplyPost");
const PostedReply = require("../../../Domains/replies/entities/PostedReply");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("postReply function", () => {
    it("should persist post comment and return posted reply correctly", async () => {
      // Arrange
      const owner = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";

      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, owner, threadId });
      const replyPost = new ReplyPost({ content: "Reply content", owner, threadId, commentId });

      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const postedReply = await commentRepositoryPostgres.postReply(replyPost);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(postedReply.id);
      expect(replies).toHaveLength(1);
      expect(postedReply).toStrictEqual(
        new PostedReply({
          id: "reply-123",
          content: replyPost.content,
          owner: replyPost.owner,
        })
      );
    });
  });

  describe("checkReply function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const replyId = "reply-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123" });
      await RepliesTableTestHelper.addReply({ id: replyId });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.checkReply(replyId, "nocomment")).rejects.toThrowError(
        NotFoundError
      );
    });

    it("should throw NotFoundError when reply not found", async () => {
      // Arrange
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await RepliesTableTestHelper.addReply({ id: "reply-123" });
      const commentRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.checkReply("noreply", commentId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when reply found", async () => {
      // Arrange
      const replyId = "reply-123";
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await RepliesTableTestHelper.addReply({ id: replyId });
      const commentRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.checkReply(replyId, commentId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should throw UnauthorizedError when provided userId is not the comment owner", async () => {
      // Arrange
      const replyId = "reply-123";
      const userId = "user-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: userId });
      await CommentsTableTestHelper.addComment({ id: "comment-123", owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, owner: userId });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(replyRepositoryPostgres.verifyReplyOwner(replyId, "wrong-user")).rejects.toThrowError(
        AuthorizationError
      );
    });

    it("should verify the reply owner correctly", async () => {
      // Arrange
      const replyId = "reply-123";
      const userId = "user-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: "thread-123", owner: userId });
      await CommentsTableTestHelper.addComment({ id: "comment-123", owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, owner: userId });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(replyRepositoryPostgres.verifyReplyOwner(replyId, userId)).resolves.not.toThrowError(
        AuthorizationError
      );
    });
  });

  describe("deleteReplyById function", () => {
    it("should throw NotFoundError when reply not found", () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.deleteReplyById("noreply")).rejects.toThrowError(
        NotFoundError
      );
    });

    it("should delete reply by id and return success correctly", async () => {
      // Arrange
      const replyId = "reply-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123" });
      await RepliesTableTestHelper.addReply({ id: replyId });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_deleted).toEqual(true);
    });
  });

  describe("getRepliesByThreadId function", () => {
    it("should show empty array if no reply found by thread ID", async () => {
      // Arrange
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const fakeIdGenerator = () => "123"; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(commentId);

      // Assert
      expect(replies).toBeDefined();
      expect(replies).toHaveLength(0);
    });
  });

  it("should get replies by thread ID correctly", async () => {
    // Arrange
    const commentId = "comment-123";
    await UsersTableTestHelper.addUser({ id: "user-123" });
    await UsersTableTestHelper.addUser({ id: "user-124", username: "uname2" });
    await ThreadsTableTestHelper.addThread({ id: "thread-123" });
    await CommentsTableTestHelper.addComment({ id: commentId });
    await RepliesTableTestHelper.addReply({
      id: "reply-123",
      owner: "user-123",
      commentId,
      date: "2023-07-19T13:57:11.225Z",
      isDeleted: true,
    });
    await RepliesTableTestHelper.addReply({
      id: "reply-124",
      owner: "user-124",
      commentId,
      date: "2023-07-19T13:56:01.301Z",
    });
    const fakeIdGenerator = () => "123"; // stub!
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    const replies = await replyRepositoryPostgres.getRepliesByCommentId(commentId);

    // Assert
    expect(replies).toBeDefined();
    expect(replies).toHaveLength(2);
    expect(replies[0].id).toEqual("reply-124");
    expect(replies[0].date).toEqual("2023-07-19T13:56:01.301Z");
    expect(replies[0].username).toEqual("uname2");
    expect(replies[0].content).toEqual("content reply");
    expect(replies[0].is_deleted).toEqual(false);
    expect(replies[1].id).toEqual("reply-123");
    expect(replies[1].date).toEqual("2023-07-19T13:57:11.225Z");
    expect(replies[1].username).toEqual("uname");
    expect(replies[1].content).toEqual("content reply");
    expect(replies[1].is_deleted).toEqual(true);
  });
});
