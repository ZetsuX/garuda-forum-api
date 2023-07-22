const pool = require("../../database/postgres/pool");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const LikeRepositoryPostgres = require("../LikeRepositoryPostgres");
const LikePut = require("../../../Domains/likes/entities/LikePut");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("LikeRepositoryPostgres", () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("postLike function", () => {
    it("should persist post like and return posted like correctly", async () => {
      // Arrange
      const owner = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const likePut = new LikePut({ owner, threadId, commentId });
      const fakeIdGenerator = () => "123"; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.postLike(likePut.commentId, likePut.owner);

      // Assert
      const likes = await LikesTableTestHelper.findLikesById("like-123");
      expect(likes).toBeDefined();
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toEqual("like-123");
      expect(likes[0].comment_id).toEqual(likePut.commentId);
      expect(likes[0].owner).toEqual(likePut.owner);
      expect(likes[0].is_deleted).toEqual(false);
    });
  });

  describe("checkLike function", () => {
    it("should not return any like when like not found", async () => {
      // Arrange
      const commentId = "comment-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const like = await likeRepositoryPostgres.checkLike(commentId, "noowner");

      // Assert
      expect(like).toBeUndefined();
    });

    it("should return like when like is found", async () => {
      // Arrange
      const commentId = "comment-123";
      const owner = "user-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await LikesTableTestHelper.addLike({ id: "like-123" });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const like = await likeRepositoryPostgres.checkLike(commentId, owner);

      // Assert
      expect(like).toBeDefined();
      expect(like.id).toEqual("like-123");
      expect(like.is_deleted).toEqual(false);
    });
  });

  describe("changeLikeStatus", () => {
    it("should return NotFoundError when like does not exist", async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(likeRepositoryPostgres.changeLikeStatus("nolike", false)).rejects.toThrowError(
        NotFoundError
      );
    });

    it("should change 'is_deleted' column successfully when like exists", async () => {
      // Arrange
      const commentId = "comment-123";
      const owner = "user-123";
      const likeId = "like-123";
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: "thread-123" });
      await CommentsTableTestHelper.addComment({ id: commentId });
      await LikesTableTestHelper.addLike({ id: likeId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.changeLikeStatus({ id: likeId, is_deleted: false });

      // Assert
      const likes = await LikesTableTestHelper.findLikesById(likeId);
      expect(likes).toBeDefined();
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toEqual(likeId);
      expect(likes[0].comment_id).toEqual(commentId);
      expect(likes[0].owner).toEqual(owner);
      expect(likes[0].is_deleted).toEqual(true);
    });
  });

  describe("getLikeCountsByThreadId function", () => {
    it("should show empty array if no comment found by thread ID", async () => {
      // Arrange
      const threadId = "thread-123";
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      const fakeIdGenerator = () => "123"; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId(threadId);

      // Assert
      expect(likeCounts).toBeDefined();
      expect(likeCounts).toHaveLength(0);
    });
  });

  it("should get like counts by thread ID correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    const commentId1 = "comment-123";
    const commentId2 = "comment-124";
    const owner1 = "user-123";
    const owner2 = "user-124";
    await UsersTableTestHelper.addUser({ id: owner1 });
    await UsersTableTestHelper.addUser({ id: owner2, username: "uname2" });
    await ThreadsTableTestHelper.addThread({ id: threadId });
    await CommentsTableTestHelper.addComment({
      id: commentId1,
      threadId,
      date: "2023-07-17T13:57:11.225Z",
    });
    await CommentsTableTestHelper.addComment({
      id: commentId2,
      threadId,
      date: "2023-07-18T13:57:11.225Z",
    });

    await LikesTableTestHelper.addLike({
      id: "like-123",
      owner: owner1,
      commentId: commentId1,
      isDeleted: true,
    });
    await LikesTableTestHelper.addLike({
      id: "like-124",
      owner: owner2,
      commentId: commentId2,
    });
    await LikesTableTestHelper.addLike({
      id: "like-125",
      owner: owner2,
      commentId: commentId2,
    });
    const fakeIdGenerator = () => "123"; // stub!
    const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

    // Action
    const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId(threadId);

    // Assert
    expect(likeCounts).toBeDefined();
    expect(likeCounts).toHaveLength(2);
    expect(likeCounts[0].comment_id).toEqual(commentId1);
    expect(likeCounts[0].like_count).toEqual("0");
    expect(likeCounts[1].comment_id).toEqual(commentId2);
    expect(likeCounts[1].like_count).toEqual("2");
  });
});
