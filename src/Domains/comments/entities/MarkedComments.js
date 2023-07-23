class MarkedComments {
  constructor(payload) {
    const markedComments = this._markDeleted(payload);
    this.comments = markedComments;
  }

  returnMarked() {
    return this.comments;
  }

  _markDeleted(comments) {
    for (const comment of comments) {
      if (comment.is_deleted) {
        comment.content = "**komentar telah dihapus**";
      }
      delete comment.is_deleted;
    }
    return comments;
  }
}

module.exports = MarkedComments;
