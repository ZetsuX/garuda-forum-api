const PutLikeUseCase = require("../../../../Applications/use_case/PutLikeUseCase");

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const putLikeUseCase = this._container.getInstance(PutLikeUseCase.name);
    await putLikeUseCase.execute({ owner, threadId, commentId });

    const response = h.response({ status: "success" });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
