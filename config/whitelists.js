module.exports = {
  cords: {
    model: [
      "status",
      "description",
      "app",
      "category",
      "puller",
      "rescuers",
      "openedOn",
      "title",
      "likes",
      "tags"
    ],

    update: [
      "status",
      "description",
      "discussion",
      "app",
      "category",
      "rescuers",
      "resolvedOn",
      "title",
      "tags"
    ]
  },

  users: {
    model: [
      "apps",
      "email",
      "firstName",
      "lastName",
      "teams",
      "user"
    ]
  },

  teams: {
    model: [
      "name",
      "members",
      "createdOn",
      "lastModifiedOn"
    ]
  }
};
