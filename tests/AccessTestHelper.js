/* istanbul ignore file */
const Jwt = require("@hapi/jwt");
const UsersTableTestHelper = require("./UsersTableTestHelper");

const AccessTestHelper = {
  async getToken() {
    const userPayload = {
      username: "access",
      id: "user-121",
    };
    await UsersTableTestHelper.addUser(userPayload);
    return Jwt.token.generate(userPayload, process.env.ACCESS_TOKEN_KEY);
  },
};

module.exports = AccessTestHelper;
