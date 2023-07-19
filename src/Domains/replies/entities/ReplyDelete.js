class ReplyDelete {
  constructor(payload) {
    this._verifyPayload(payload);

    const { replyId, commentId, threadId, owner } = payload;

    this.replyId = replyId;
    this.commentId = commentId;
    this.threadId = threadId;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    const { replyId, commentId, threadId, owner } = payload;

    if (!replyId || !commentId || !threadId || !owner) {
      throw new Error("REPLY_DELETE.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof replyId !== "string" ||
      typeof commentId !== "string" ||
      typeof threadId !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("REPLY_DELETE.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = ReplyDelete;
