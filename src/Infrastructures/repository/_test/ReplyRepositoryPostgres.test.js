const pool = require("../../database/postgres/pool");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const ReplyPost = require("../../../Domains/replies/entities/ReplyPost");
const PostedReply = require("../../../Domains/replies/entities/PostedReply");

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
    it("should persist post comment and return posted comment correctly", async () => {
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
});
