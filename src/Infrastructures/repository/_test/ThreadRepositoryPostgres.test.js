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
      expect(threads).toBeDefined();
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toEqual("thread-123");
      expect(threads[0].title).toEqual(postThread.title);
      expect(threads[0].owner).toEqual(postThread.owner);
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
    it("should throw NotFoundError when thread is not found", async () => {
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
        date: "2021-08-08T07:26:21.338Z",
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
      expect(thread.date).toEqual(new Date(threadData.date));
      expect(thread.username).toEqual(userData.username);
    });
  });

  describe("checkThread function", () => {
    it("should throw NotFoundError when thread does not exist", async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(threadRepositoryPostgres.checkThread("hello-world")).rejects.toThrowError(
        NotFoundError
      );
    });

    it("should not throw NotFoundError when thread exists", async () => {
      // Arrange
      const owner = "user-123";
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action and Assert
      return expect(threadRepositoryPostgres.checkThread(threadId)).resolves.not.toThrowError(
        NotFoundError
      );
    });
  });
});
