const routes = (handler) => [
  {
    method: "POST",
    path: "/threads",
    handler: handler.postThreadHandler,
    options: {
      auth: "gforum_jwt",
    },
  },
];

module.exports = routes;
