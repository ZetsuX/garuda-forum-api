const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadPost = require("../../../Domains/threads/entities/ThreadPost");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const PostedThread = require("../../../Domains/threads/entities/PostedThread");

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
});
