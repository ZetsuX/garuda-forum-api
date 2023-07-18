const pool = require("../../database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const CommentPost = require("../../../Domains/comments/entities/CommentPost");
const PostedComment = require("../../../Domains/comments/entities/PostedComment");

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
});
