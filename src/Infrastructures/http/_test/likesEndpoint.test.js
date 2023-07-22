const pool = require("../../database/postgres/pool");
const AccessTestHelper = require("../../../../tests/AccessTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");

describe("Likes endpoints", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when PUT /threads/{threadId}/comments/{commentId}/likes", () => {
    it("should respond with status code 404 when thread or comment does not exist", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/threads/nothread/comments/nocomment/likes",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toBeDefined();
    });

    it("should respond with status code 200 and persisted like", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, owner, threadId });

      // Action
      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });
  });
});
