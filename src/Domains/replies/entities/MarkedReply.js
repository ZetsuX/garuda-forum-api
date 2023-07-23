class MarkedReply {
  constructor(payload) {
    const reply = { ...payload };

    if (reply.is_deleted) {
      reply.content = "**balasan telah dihapus**";
    }
    delete reply.is_deleted;
    delete reply.comment_id;

    this.reply = reply;
  }

  returnMarked() {
    return this.reply;
  }
}

module.exports = MarkedReply;
