const ThreadPost = require("../../Domains/threads/entities/ThreadPost");

class PostThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const threadPost = new ThreadPost(useCasePayload);
    const postedThread = await this._threadRepository.postThread(threadPost);
    return postedThread;
  }
}

module.exports = PostThreadUseCase;
