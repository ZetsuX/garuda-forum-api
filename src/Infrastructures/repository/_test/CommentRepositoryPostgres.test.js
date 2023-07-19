const pool = require("../../database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const CommentPost = require("../../../Domains/comments/entities/CommentPost");
const PostedComment = require("../../../Domains/comments/entities/PostedComment");
const CommentDelete = require("../../../Domains/comments/entities/CommentDelete");
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
      expect(comments).toHaveLength(1);
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
      const wrongUserId = "user-456";
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      expect(
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
      expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("deleteCommentById function", () => {
    it("should throw NotFoundError when comment not found", () => {
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
});
