const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadPost = require("../../../Domains/threads/entities/ThreadPost");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const PostedThread = require("../../../Domains/threads/entities/PostedThread");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("postThread function", () => {
    it("should persist create thread and return created thread correctly", async () => {
      // Arrange
      const postThread = new ThreadPost({
        title: "ttitle",
        body: "tbody",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123"; // stub!
      await UsersTableTestHelper.addUser({ id: "user-123" });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.postThread(postThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById(createdThread.id);
      expect(threads).toHaveLength(1);
      expect(createdThread).toStrictEqual(
        new PostedThread({
          id: "thread-123",
          title: "ttitle",
          owner: "user-123",
        })
      );
    });
  });

  describe("getThreadById function", () => {
    it("should throw NotFoundError when thread is not found", () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.getThreadById("hello-world")).rejects.toThrowError(
        NotFoundError
      );
    });

    it("should get thread by thread ID correctly", async () => {
      // Arrange
      const threadData = {
        id: "thread-123",
        title: "ttitle",
        body: "tbody",
        owner: "user-123",
        date: "tdate",
      };
      const userData = {
        id: "user-123",
        username: "the-username",
      };
      await UsersTableTestHelper.addUser(userData);
      await ThreadsTableTestHelper.addThread(threadData);
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const thread = await threadRepositoryPostgres.getThreadById(threadData.id);

      // Assert
      expect(thread).toBeDefined();
      expect(thread.id).toEqual(threadData.id);
      expect(thread.title).toEqual(threadData.title);
      expect(thread.body).toEqual(threadData.body);
      expect(thread.date).toEqual(threadData.date);
      expect(thread.username).toEqual(userData.username);
    });
  });
});
