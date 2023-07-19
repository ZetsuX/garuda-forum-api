const PostReplyUseCase = require("../../../../Applications/use_case/PostReplyUseCase");

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addReplyUseCase = this._container.getInstance(PostReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({ content, owner, threadId, commentId });

    const response = h.response({
      status: "success",
      data: { addedReply },
    });
    response.code(201);
    return response;
  }
}

module.exports = RepliesHandler;
