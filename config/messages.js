module.exports = {
  400: "",
  403: "",
  404: "",
  500: "",

  auth: {
    noUser: "",
    unableToAuthenticate: "Either unable to login with provided username and" +
      " password, or the account does not exist"
  },

  notifications: {
    cordCreated: "A cord has been pulled"
  },

  responses: {
    appTokenNotProvided: "appToken must be included in" +
      " querystring/params/body for request",
    bodyNotProvided: "Valid request body not provided",
    errorParsingObject: "Invalid JSON object provided",
    fileNotProvided: "Valid file not provided",
    idNotProvided: "Valid request ID not provided",
    invalidActionProvided: "Invalid action provided",
    invalidBodyProvided: "Invalid body provided",
    invalidIdProvided: "Invalid ID provided",
    invalidMemberProvided: "Invalid team member provided",
    statusNotProvided: "Valid status not provided",
    teamNotFound: "Team not found with provided ID",
    userNotProvided: "Valid users not provided"
  }
};
