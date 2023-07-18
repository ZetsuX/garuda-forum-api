const UserRegister = require("../../Domains/users/entities/UserRegister");

class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const registerUser = new UserRegister(useCasePayload);
    await this._userRepository.verifyAvailableUsername(registerUser.username);
    registerUser.password = await this._passwordHash.hash(registerUser.password);
    const registeredUser = await this._userRepository.addUser(registerUser);
    return registeredUser;
  }
}

module.exports = AddUserUseCase;
