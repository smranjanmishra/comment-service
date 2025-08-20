// Import the Express framework for building the web server.
// Search query: "Express.js framework setup Node.js"
const express = require('express');

// Create an Express application instance.
// Search query: "Express app initialization"
const webApplication = express();

// Define the port number (3000) for the server to listen on.
// Search query: "Node.js server port configuration"
const serverPort = 3000;

// Import the streamLogHandler function from index.js to handle SSE for /log endpoint.
// Search query: "Node.js module import destructuring"
const { streamLogHandler } = require('./index');

// Define a GET route for the root endpoint (/).
// Search query: "Express.js GET route handler"
webApplication.get('/', (request, response) => {
    // Log a message to the console for debugging when the root endpoint is accessed.
    console.log('Root endpoint accessed');
    // Send a plain text response "WebBrowser output" to the client.
    response.send('Web-Browser output');
});

// Define a GET route for the /log endpoint to stream log updates.
// Search query: "Express.js route handler function assignment"
webApplication.get('/log', streamLogHandler);

// Start the server and listen on the specified port.
// Search query: "Express.js server listen method"
webApplication.listen(serverPort, () => {
    // Log a message to confirm the server is running and listening.
    // Search query: "Node.js server startup confirmation log"
    console.log(`Log monitoring server running on port ${serverPort}`);
});