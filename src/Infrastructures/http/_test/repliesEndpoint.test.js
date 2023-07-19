const pool = require("../../database/postgres/pool");
const AccessTestHelper = require("../../../../tests/AccessTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");

describe("Replies endpoints", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {};
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when request payload not meet data type specification", async () => {
      // Arrange
      const requestPayload = { content: 123 };
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat reply baru karena tipe data tidak sesuai"
      );
    });

    it("should response 201 and persisted reply", async () => {
      // Arrange
      const requestPayload = { content: "Reply content" };
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    it("should response 403 when user is not an authorized owner of the reply", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";
      const otherUserId = "other-user";
      await UsersTableTestHelper.addUser({ id: otherUserId, username: "otherusername" });

      const threadId = "thread-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });

      const commentId = "comment-123";
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });

      const replyId = "reply-123";
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: otherUserId });

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("tidak dapat mengakses resource ini");
    });

    it("should response 404 when thread or comment does not exist", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/threads/no-thread/comments/no-comment/replies/no-reply",
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

    it("should response 200 and delete reply successfully", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";

      const threadId = "thread-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });

      const commentId = "comment-123";
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });

      const replyId = "reply-123";
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner });

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
