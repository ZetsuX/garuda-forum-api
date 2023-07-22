const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const AccessTestHelper = require("../../../../tests/AccessTestHelper");

describe("Threads endpoints", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should respond with status code 201 and persisted thread", async () => {
      // Arrange
      const requestPayload = {
        title: "ttitle",
        body: "tbody",
      };
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it("should respond with status code 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        title: "ttitle",
      };
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
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
        "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should respond with status code 400 when request payload not meet data type specification", async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: ["tbody"],
      };
      const accessToken = await AccessTestHelper.getToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
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
        "tidak dapat membuat thread baru karena tipe data tidak sesuai"
      );
    });
  });

  describe("when GET /threads/{threadId}", () => {
    it("should respond with status code 404 when thread with threadId not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "GET",
        url: "/threads/nothread",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("thread tidak ditemukan");
    });

    it("should respond with status code 200 and get thread detail by id", async () => {
      // Arrange
      const threadId = "thread-123";
      const owner = "user-123";
      const repliedCommentId = "comment-123";
      const unrepliedCommentId = "comment-124";
      const username = "uname";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({ id: repliedCommentId, threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: unrepliedCommentId,
        threadId,
        owner,
        isDeleted: true,
        date: "2021-08-08T07:27:21.338Z",
      });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: repliedCommentId,
        owner,
        date: "2021-08-12T07:26:21.338Z",
      });
      await LikesTableTestHelper.addLike({
        id: "like-123",
        commentId: unrepliedCommentId,
        owner,
      });

      const expectedComments = [
        {
          id: repliedCommentId,
          username,
          date: "2021-08-08T07:26:21.338Z",
          replies: [
            {
              id: "reply-123",
              content: "content reply",
              username,
              date: "2021-08-12T07:26:21.338Z",
            },
          ],
          content: "comment content",
          likeCount: 0,
        },
        {
          id: unrepliedCommentId,
          username,
          date: "2021-08-08T07:27:21.338Z",
          replies: [],
          content: "**komentar telah dihapus**",
          likeCount: 1,
        },
      ];

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toStrictEqual(expectedComments);
    });
  });
});
