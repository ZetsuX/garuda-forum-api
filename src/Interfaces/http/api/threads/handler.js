const PostThreadUseCase = require("../../../../Applications/use_case/PostThreadUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { title, body } = request.payload;
    const { id } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance(PostThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({ title, body, owner: id });

    const response = h.response({
      status: "success",
      data: { addedThread },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;
