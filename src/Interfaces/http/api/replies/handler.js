const PostReplyUseCase = require("../../../../Applications/use_case/PostReplyUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
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

  async deleteReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute({ threadId, commentId, replyId, owner });

    const response = h.response({ status: "success" });
    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
