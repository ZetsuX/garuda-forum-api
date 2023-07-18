const UserRepository = require("../../../Domains/users/UserRepository");
const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const AuthTokenManager = require("../../security/AuthTokenManager");
const PasswordHash = require("../../security/PasswordHash");
const LoginUserUseCase = require("../LoginUserUseCase");
const NewAuth = require("../../../Domains/authentications/entities/NewAuth");

describe("LoginUserUseCase", () => {
  it("should orchestrate the get authentication action correctly", async () => {
    // Arrange
    const useCasePayload = {
      username: "uname",
      password: "secret",
    };
    const expectedAuthentication = new NewAuth({
      accessToken: "access_token",
      refreshToken: "refresh_token",
    });
    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthTokenManager = new AuthTokenManager();
    const mockPasswordHash = new PasswordHash();

    // Mocking
    mockUserRepository.getPasswordByUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve("encrypted_password"));
    mockUserRepository.getIdByUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve("user-123"));
    mockPasswordHash.compare = jest.fn().mockImplementation(() => Promise.resolve());
    mockAuthTokenManager.createAccessToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAuthentication.accessToken));
    mockAuthTokenManager.createRefreshToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedAuthentication.refreshToken));
    mockAuthenticationRepository.addToken = jest.fn().mockImplementation(() => Promise.resolve());

    // create use case instance
    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualAuthentication = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(actualAuthentication).toEqual(expectedAuthentication);
    expect(mockUserRepository.getPasswordByUsername).toBeCalledWith("uname");
    expect(mockUserRepository.getIdByUsername).toBeCalledWith("uname");
    expect(mockPasswordHash.compare).toBeCalledWith("secret", "encrypted_password");
    expect(mockAuthTokenManager.createAccessToken).toBeCalledWith({
      username: "uname",
      id: "user-123",
    });
    expect(mockAuthTokenManager.createRefreshToken).toBeCalledWith({
      username: "uname",
      id: "user-123",
    });
    expect(mockAuthenticationRepository.addToken).toBeCalledWith(
      expectedAuthentication.refreshToken
    );
  });
});
