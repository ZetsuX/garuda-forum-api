const InvariantError = require("./InvariantError");

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  "REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada"
  ),
  "REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat user baru karena tipe data tidak sesuai"
  ),
  "REGISTER_USER.USERNAME_LIMIT_CHAR": new InvariantError(
    "tidak dapat membuat user baru karena karakter username melebihi batas limit"
  ),
  "REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER": new InvariantError(
    "tidak dapat membuat user baru karena username mengandung karakter terlarang"
  ),
  "USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "harus mengirimkan username dan password"
  ),
  "USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "username dan password harus string"
  ),
  "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN": new InvariantError(
    "harus mengirimkan token refresh"
  ),
  "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "refresh token harus string"
  ),
  "DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN": new InvariantError(
    "harus mengirimkan token refresh"
  ),
  "DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "refresh token harus string"
  ),
  "THREAD_POST.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada"
  ),
  "THREAD_POST.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat thread baru karena tipe data tidak sesuai"
  ),
  "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat melihat detail thread karena properti yang dibutuhkan tidak ada"
  ),
  "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat melihat detail thread karena tipe data tidak sesuai"
  ),
  "COMMENT_POST.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada"
  ),
  "COMMENT_POST.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat comment baru karena tipe data tidak sesuai"
  ),
  "COMMENT_DELETE.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat menghapus comment karena properti yang dibutuhkan tidak ada"
  ),
  "COMMENT_DELETE.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat menghapus comment karena tipe data tidak sesuai"
  ),
  "REPLY_POST.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada"
  ),
  "REPLY_POST.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat reply baru karena tipe data tidak sesuai"
  ),
  "REPLY_DELETE.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat menghapus reply baru karena properti yang dibutuhkan tidak ada"
  ),
  "REPLY_DELETE.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat menghapus reply baru karena tipe data tidak sesuai"
  ),
  "LIKE_PUT.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat melakukan like/unlike karena properti yang dibutuhkan tidak ada"
  ),
  "LIKE_PUT.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat melakukan like/unlike karena tipe data tidak sesuai"
  ),
};

module.exports = DomainErrorTranslator;
