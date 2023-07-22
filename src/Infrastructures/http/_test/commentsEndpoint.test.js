const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const AccessTestHelper = require("../../../../tests/AccessTestHelper");

describe("Comments endpoints", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads/thread-123/comments", () => {
    it("should respond with status code 201 and persisted comment", async () => {
      // Arrange
      const requestPayload = { content: "content comment" };
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const threadId = "thread-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: "user-121" });

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it("should respond with status code 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {};
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const threadId = "thread-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: "user-121" });

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
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
        "tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should respond with status code 400 when request payload not meet data type specification", async () => {
      // Arrange
      const requestPayload = { content: 123 };
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const threadId = "thread-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: "user-121" });

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
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
        "tidak dapat membuat comment baru karena tipe data tidak sesuai"
      );
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
    it("should respond with status code 403 when user is not an authorized owner of the comment", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";
      const anotherUserId = "user-not-owner";
      await UsersTableTestHelper.addUser({ id: anotherUserId, username: "user-not-owner" });

      const threadId = "thread-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });

      const commentId = "comment-123";
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: anotherUserId });

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
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

    it("should respond with status code 404 when comment does not exist", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const threadId = "thread-135";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: "user-121" });

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/nocomment`,
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

    it("should respond with status code 404 when thread does not exist", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";
      const threadId = "thread-135";
      const commentId = "comment-246";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/nothread/comments/${commentId}`,
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

    it("should respond with status code 201 and delete comment successfully", async () => {
      // Arrange
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      const owner = "user-121";
      const threadId = "thread-123";
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });

      const commentId = "comment-123";
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner });

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
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
