const { sendEmailVerified } = require("./src/services/mail");

const testData = {
  email: "test@example.com",
  name: "John Doe",
};

sendEmailVerified({ email: testData.email, name: testData.name });

// Run the test
