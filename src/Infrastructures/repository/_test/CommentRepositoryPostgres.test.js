const pool = require("../../database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const CommentPost = require("../../../Domains/comments/entities/CommentPost");
const PostedComment = require("../../../Domains/comments/entities/PostedComment");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("postComment function", () => {
    it("should persist post comment and return posted comment correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      const postComment = new CommentPost({
        content: "Comment content",
        owner: "user-123",
        threadId: "thread-123",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const postedComment = await commentRepositoryPostgres.postComment(postComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(postedComment.id);
      expect(comments).toBeDefined();
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual("comment-123");
      expect(comments[0].content).toEqual(postComment.content);
      expect(comments[0].owner).toEqual(postComment.owner);
      expect(postedComment).toStrictEqual(
        new PostedComment({
          id: "comment-123",
          content: postComment.content,
          owner: postComment.owner,
        })
      );
    });
  });

  describe("checkComment function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.checkComment("nocomment", threadId)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const commentId = "comment-123";
      const threadId = "thread-123";
      const owner = "user-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, owner, threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.checkComment(commentId, "nothread")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when comment found", async () => {
      // Arrange
      const commentId = "comment-123";
      const threadId = "thread-123";
      const owner = "user-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, owner, threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.checkComment(commentId, threadId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw UnauthorizedError when provided userId is not the comment owner", async () => {
      // Arrange
      const commentId = "comment-123";
      const userId = "user-123";
      const wrongUserId = "user-124";
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, wrongUserId)
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should verify the comment owner correctly", async () => {
      // Arrange
      const commentId = "comment-123";
      const userId = "user-123";
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("deleteCommentById function", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(commentRepositoryPostgres.deleteCommentById("nocomment")).rejects.toThrowError(
        NotFoundError
      );
    });

    it("should delete comment by id and return success correctly", async () => {
      // Arrange
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toEqual(true);
    });
  });

  describe("getCommentByThreadId function", () => {
    it("should show empty array if no comment found by thread ID", async () => {
      // Arrange
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(comments).toBeDefined();
      expect(comments).toHaveLength(0);
    });
  });

  it("should get comments by thread ID correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    await UsersTableTestHelper.addUser({ id: "user-123" });
    await UsersTableTestHelper.addUser({ id: "user-124", username: "uname2" });
    await ThreadsTableTestHelper.addThread({ id: threadId });
    await CommentsTableTestHelper.addComment({
      id: "comment-123",
      owner: "user-123",
      threadId,
      date: "2023-07-19T13:57:11.225Z",
      isDeleted: true,
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-124",
      owner: "user-124",
      threadId,
      date: "2023-07-19T13:56:01.301Z",
    });
    const fakeIdGenerator = () => "123"; // stub!
    const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

    // Assert
    expect(comments).toBeDefined();
    expect(comments).toHaveLength(2);
    expect(comments[0].id).toEqual("comment-124");
    expect(comments[0].date).toEqual(new Date("2023-07-19T13:56:01.301Z"));
    expect(comments[0].username).toEqual("uname2");
    expect(comments[0].content).toEqual("comment content");
    expect(comments[0].is_deleted).toEqual(false);
    expect(comments[1].id).toEqual("comment-123");
    expect(comments[1].date).toEqual(new Date("2023-07-19T13:57:11.225Z"));
    expect(comments[1].username).toEqual("uname");
    expect(comments[1].content).toEqual("comment content");
    expect(comments[1].is_deleted).toEqual(true);
  });

  it("should get comments by thread ID correctly with the deleted comments marked", async () => {
    // Arrange
    const threadId = "thread-123";
    await UsersTableTestHelper.addUser({ id: "user-123" });
    await UsersTableTestHelper.addUser({ id: "user-124", username: "uname2" });
    await ThreadsTableTestHelper.addThread({ id: threadId });
    await CommentsTableTestHelper.addComment({
      id: "comment-123",
      owner: "user-123",
      threadId,
      date: "2023-07-19T13:57:11.225Z",
      isDeleted: true,
    });
    await CommentsTableTestHelper.addComment({
      id: "comment-124",
      owner: "user-124",
      threadId,
      date: "2023-07-19T13:56:01.301Z",
    });
    const fakeIdGenerator = () => "123"; // stub!
    const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId, true);

    // Assert
    expect(comments).toBeDefined();
    expect(comments).toHaveLength(2);
    expect(comments[0].id).toEqual("comment-124");
    expect(comments[0].date).toEqual(new Date("2023-07-19T13:56:01.301Z"));
    expect(comments[0].username).toEqual("uname2");
    expect(comments[0].content).toEqual("comment content");
    expect(comments[1].id).toEqual("comment-123");
    expect(comments[1].date).toEqual(new Date("2023-07-19T13:57:11.225Z"));
    expect(comments[1].username).toEqual("uname");
    expect(comments[1].content).toEqual("**komentar telah dihapus**");
  });
});
