const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const AuthTokenManager = require("../../../Applications/security/AuthTokenManager");

describe("Users endpoints", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe("when POST /authentications", () => {
    it("should respond with status code 201 and new authentication", async () => {
      // Arrange
      const requestPayload = {
        username: "uname",
        password: "secret",
      };
      const server = await createServer(container);
      // add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "uname",
          password: "secret",
          fullname: "Full Name",
        },
      });

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it("should respond with status code 400 if username not found", async () => {
      // Arrange
      const requestPayload = {
        username: "uname",
        password: "secret",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("username tidak ditemukan");
    });

    it("should respond with status code 401 if password wrong", async () => {
      // Arrange
      const requestPayload = {
        username: "uname",
        password: "wrong_password",
      };
      const server = await createServer(container);
      // Add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "uname",
          password: "secret",
          fullname: "Full Name",
        },
      });

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("kredensial yang Anda masukkan salah");
    });

    it("should respond with status code 400 if login payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        username: "uname",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("harus mengirimkan username dan password");
    });

    it("should respond with status code 400 if login payload wrong data type", async () => {
      // Arrange
      const requestPayload = {
        username: 123,
        password: "secret",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("username dan password harus string");
    });
  });

  describe("when PUT /authentications", () => {
    it("should return 200 and new access token", async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "uname",
          password: "secret",
          fullname: "Full Name",
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: {
          username: "uname",
          password: "secret",
        },
      });
      const {
        data: { refreshToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: {
          refreshToken,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
    });

    it("should return 400 payload not contain refresh token", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("harus mengirimkan token refresh");
    });

    it("should return 400 if refresh token not string", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: {
          refreshToken: 123,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("refresh token harus string");
    });

    it("should return 400 if refresh token not valid", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: {
          refreshToken: "invalid_refresh_token",
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("refresh token tidak valid");
    });

    it("should return 400 if refresh token not registered in database", async () => {
      // Arrange
      const server = await createServer(container);
      const refreshToken = await container
        .getInstance(AuthTokenManager.name)
        .createRefreshToken({ username: "uname" });

      // Action
      const response = await server.inject({
        method: "PUT",
        url: "/authentications",
        payload: {
          refreshToken,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("refresh token tidak ditemukan di database");
    });
  });

  describe("when DELETE /authentications", () => {
    it("should respond with status code 200 if refresh token valid", async () => {
      // Arrange
      const server = await createServer(container);
      const refreshToken = "refresh_token";
      await AuthenticationsTableTestHelper.addToken(refreshToken);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/authentications",
        payload: {
          refreshToken,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should respond with status code 400 if refresh token not registered in database", async () => {
      // Arrange
      const server = await createServer(container);
      const refreshToken = "refresh_token";

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/authentications",
        payload: {
          refreshToken,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("refresh token tidak ditemukan di database");
    });

    it("should respond with status code 400 if payload not contain refresh token", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/authentications",
        payload: {},
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("harus mengirimkan token refresh");
    });

    it("should respond with status code 400 if refresh token not string", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/authentications",
        payload: {
          refreshToken: 123,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("refresh token harus string");
    });
  });
});
