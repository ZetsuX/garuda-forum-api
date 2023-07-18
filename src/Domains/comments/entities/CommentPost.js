class CommentPost {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, owner, threadId } = payload;

    this.content = content;
    this.owner = owner;
    this.threadId = threadId;
  }

  _verifyPayload(payload) {
    const { content, owner, threadId } = payload;

    if (!content || !owner || !threadId) {
      throw new Error("COMMENT_POST.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (typeof content !== "string" || typeof owner !== "string" || typeof threadId !== "string") {
      throw new Error("COMMENT_POST.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = CommentPost;
