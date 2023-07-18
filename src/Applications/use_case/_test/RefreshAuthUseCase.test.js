const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const AuthTokenManager = require("../../security/AuthTokenManager");
const RefreshAuthUseCase = require("../RefreshAuthUseCase");

describe("RefreshAuthUseCase", () => {
  it("should throw error if use case payload not contain refresh token", async () => {
    // Arrange
    const useCasePayload = {};
    const refreshAuthenticationUseCase = new RefreshAuthUseCase({});

    // Action & Assert
    await expect(refreshAuthenticationUseCase.execute(useCasePayload)).rejects.toThrowError(
      "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN"
    );
  });

  it("should throw error if refresh token not string", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 1,
    };
    const refreshAuthenticationUseCase = new RefreshAuthUseCase({});

    // Action & Assert
    await expect(refreshAuthenticationUseCase.execute(useCasePayload)).rejects.toThrowError(
      "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should orchestrating the refresh authentication action correctly", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: "some_refresh_token",
    };
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthTokenManager = new AuthTokenManager();
    // Mocking
    mockAuthenticationRepository.checkAvailabilityToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthTokenManager.verifyRefreshToken = jest.fn().mockImplementation(() => Promise.resolve());
    mockAuthTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ username: "dicoding" }));
    mockAuthTokenManager.createAccessToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve("some_new_access_token"));
    // Create the use case instace
    const refreshAuthenticationUseCase = new RefreshAuthUseCase({
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthTokenManager,
    });

    // Action
    const accessToken = await refreshAuthenticationUseCase.execute(useCasePayload);

    // Assert
    expect(mockAuthTokenManager.verifyRefreshToken).toBeCalledWith(useCasePayload.refreshToken);
    expect(mockAuthenticationRepository.checkAvailabilityToken).toBeCalledWith(
      useCasePayload.refreshToken
    );
    expect(mockAuthTokenManager.decodePayload).toBeCalledWith(useCasePayload.refreshToken);
    expect(mockAuthTokenManager.createAccessToken).toBeCalledWith({ username: "dicoding" });
    expect(accessToken).toEqual("some_new_access_token");
  });
});
