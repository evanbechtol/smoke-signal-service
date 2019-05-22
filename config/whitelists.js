module.exports = {
  cords: {
    answer: [
      "answer",
      "user"
    ],

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
    members: [
      "_id",
      "email",
      "firstName",
      "lastName",
      "user"
    ],

    model: [
      "name",
      "members",
      "createdOn",
      "lastModifiedOn"
    ]
  }
};
