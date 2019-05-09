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
    errorParsingObject: "Invalid JSON object provided",
    fileNotProvided: "Valid file not provided",
    idNotProvided: "Valid request ID not provided",
    invalidIdProvided: "Invalid ID or body provided",
    bodyNotProvided: "Valid request body not provided",
    statusNotProvided: "Valid status not provided",
    userNotProvided: "Valid users not provided"
  }
};
