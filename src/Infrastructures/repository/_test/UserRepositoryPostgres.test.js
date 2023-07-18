const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const InvariantError = require("../../../Commons/exceptions/InvariantError");
const UserRegister = require("../../../Domains/users/entities/UserRegister");
const RegisteredUser = require("../../../Domains/users/entities/RegisteredUser");
const pool = require("../../database/postgres/pool");
const UserRepositoryPostgres = require("../UserRepositoryPostgres");

describe("UserRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyAvailableUsername function", () => {
    it("should throw InvariantError when username not available", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: "usernametest" }); // memasukan user baru dengan username usernametest
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        userRepositoryPostgres.verifyAvailableUsername("usernametest")
      ).rejects.toThrowError(InvariantError);
    });

    it("should not throw InvariantError when username available", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        userRepositoryPostgres.verifyAvailableUsername("usernametest")
      ).resolves.not.toThrowError(InvariantError);
    });
  });

  describe("addUser function", () => {
    it("should persist register user and return registered user correctly", async () => {
      // Arrange
      const registerUser = new UserRegister({
        username: "usernametest",
        password: "secret_password",
        fullname: "Dicoding Indonesia",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);

      // Assert
      const users = await UsersTableTestHelper.findUsersById("user-123");
      expect(users).toHaveLength(1);
    });

    it("should return registered user correctly", async () => {
      // Arrange
      const registerUser = new UserRegister({
        username: "usernametest",
        password: "secret_password",
        fullname: "Dicoding Indonesia",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(
        new RegisteredUser({
          id: "user-123",
          username: "usernametest",
          fullname: "Dicoding Indonesia",
        })
      );
    });
  });

  describe("getPasswordByUsername function", () => {
    it("should throw InvariantError when user not found", () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        userRepositoryPostgres.getPasswordByUsername("usernametest")
      ).rejects.toThrowError(InvariantError);
    });

    it("should return username password when user is found", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        username: "usernametest",
        password: "secret_password",
      });

      // Action & Assert
      const password = await userRepositoryPostgres.getPasswordByUsername("usernametest");
      expect(password).toBe("secret_password");
    });
  });

  describe("getIdByUsername function", () => {
    it("should throw InvariantError when user not found", async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.getIdByUsername("usernametest")).rejects.toThrowError(
        InvariantError
      );
    });

    it("should return user id correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123", username: "usernametest" });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const userId = await userRepositoryPostgres.getIdByUsername("usernametest");

      // Assert
      expect(userId).toEqual("user-123");
    });
  });
});
