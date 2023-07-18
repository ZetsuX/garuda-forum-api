const PostCommentUseCase = require("../../../../Applications/use_case/PostCommentUseCase");

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance(PostCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute({ content, owner, threadId });

    const response = h.response({
      status: "success",
      data: { addedComment },
    });
    response.code(201);
    return response;
  }
}

module.exports = CommentsHandler;
