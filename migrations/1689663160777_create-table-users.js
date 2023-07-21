exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    username: {
      type: "VARCHAR(50)",
      notNull: true,
      unique: true,
    },
    password: {
      type: "TEXT",
      notNull: true,
    },
    fullname: {
      type: "TEXT",
      notNull: true,
    },
    created_at: {
      type: "TIMESTAMP WITH TIME ZONE",
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "TIMESTAMP WITH TIME ZONE",
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("users");
};
