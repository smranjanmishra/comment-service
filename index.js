// Import the Node.js 'fs' module for file system operations (synchronous and callback-based).
// Search query: "Node.js fs module file system operations"
const fileSystem = require('fs');

// Import the 'fs.promises' module for Promise-based file system operations.
// Search query: "Node.js fs promises async file operations"
const fileSystemPromises = require('fs').promises;

// Define the path to the log file to monitor ('test.txt' in the same directory).
// Search query: "Node.js file path relative directory"
const logFilePath = './test.txt';

// Initialize an array to store the last 10 lines of the log file.
// Search query: "Node.js array initialization for data storage"
let recentLogLines = [];

// Initialize an object to store active SSE client responses, keyed by request ID.
// Search query: "Node.js object hash map for client storage"
let clientConnectionPool = {};

// Initialize an array to store request IDs of active SSE clients.
// Search query: "Node.js array for tracking client identifiers"
let activeClientIds = [];

// **Imports fileSystem and fileSystemPromises for file operations.
// Defines logFilePath as test.txt, the log file to monitor.
// Initializes recentLogLines (array for last 10 lines), clientConnectionPool (object for client responses), and activeClientIds (array for client IDs).**

// Define an async function to read the last 10 lines from the log file.
// Search query: "Node.js async function read file last lines"
async function fetchRecentLogLines() {
    // Use a try-catch block to handle potential file access errors.
    // Search query: "Node.js try catch error handling async"
    try {
        // Get file metadata (e.g., size) using Promise-based stat.
        // Search query: "Node.js fs promises stat file metadata"
        const fileStats = await fileSystemPromises.stat(logFilePath);
        // Create a read stream starting from the last ~1000 bytes to optimize for large files.
        // Search query: "Node.js createReadStream file tail reading"
        const readStream = fileSystem.createReadStream(logFilePath, {
            // Ensure start is not negative; read last 1000 bytes (adjustable for larger files).
            // Search query: "Node.js stream start position calculation"
            start: Math.max(0, fileStats.size - 1000),
            // Set encoding to 'utf8' to read as text.
            // Search query: "Node.js stream encoding utf8"
            encoding: 'utf8'
        });
        // Initialize a string to accumulate file data.
        // Search query: "Node.js string accumulation from stream"
        let fileContent = '';
        // Iterate over stream chunks asynchronously to build the data string.
        // Search query: "Node.js for await stream chunk iteration"
        for await (const dataChunk of readStream) {
            // Append each chunk to the data string.
            // Search query: "Node.js string concatenation stream chunks"
            fileContent += dataChunk;
        }
        // Split data into lines, filter out empty lines, and take the last 10.
        // Search query: "Node.js string split filter slice operations"
        const logLines = fileContent.split('\n').filter(line => line.trim() !== '').slice(-10);
        // Store the last 10 lines in the global recentLogLines array.
        // Search query: "Node.js global variable assignment"
        recentLogLines = logLines;
    // Catch any errors (e.g., file not found) and log them.
    } catch (error) {
        // Log the error for debugging.
        // Search query: "Node.js error logging console error"
        console.error('Error reading recent log lines:', error);
        // Reset recentLogLines to empty array to avoid breaking the app.
        // Corner case: If the file is empty or doesn't exist, recentLogLines is set to empty.
        recentLogLines = [];
    }
}

// **Reading Recent Log Lines (fetchRecentLogLines):
// Uses fileSystemPromises.stat to get the file size.
// Creates a read stream starting from the last ~1000 bytes to optimize for large files (avoids reading the entire file).
// Accumulates data, splits it into lines, filters out empty lines, and takes the last 10 to store in recentLogLines.
// Handles errors (e.g., file not found) by setting recentLogLines to an empty array.**

// Define a function to send an SSE message to a client.
// Search query: "Node.js SSE server sent events formatting"
function transmitSSEMessage(clientResponse, messageData) {
    // Write the data in SSE format (data: <message>\n\n).
    // Search query: "SSE message format specification"
    clientResponse.write(`data: ${messageData}\n\n`);
}

// Define a function to send the last 10 lines to a client.
// Search query: "Node.js array forEach iteration SSE"
function sendHistoricalLines(clientResponse) {
    // Iterate over recentLogLines array and send each line as an SSE event.
    // Search query: "Node.js forEach array iteration callback"
    recentLogLines.forEach(logLine => transmitSSEMessage(clientResponse, logLine));
}

// **SSE Formatting (transmitSSEMessage and sendHistoricalLines):
// transmitSSEMessage formats data in SSE format (data: <message>\n\n) and sends it to a client.
// sendHistoricalLines sends all lines in recentLogLines to a client on initial connection.**

// Define an async function to monitor the log file for changes.
// Search query: "Node.js file watching monitoring async function"
async function monitorLogFileChanges() {
    // Use a try-catch block to handle file watching errors.
    // Search query: "Node.js file monitoring error handling"
    try {
        // Initialize recentLogLines by reading the last 10 lines of the file.
        // Search query: "Node.js async function call initialization"
        await fetchRecentLogLines();

        // Watch the file for changes, polling every 100ms.
        // Search query: "Node.js fs watchFile polling interval"
        fileSystem.watchFile(logFilePath, { interval: 100 }, async (currentStats, previousStats) => {
            // Skip if file size hasn't increased (e.g., no new data or file truncated).
            // Corner case: If the file shrinks, updates are skipped (currentStats.size <= previousStats.size).
            // Search query: "Node.js file size comparison monitoring"
            if (currentStats.size <= previousStats.size) return;
            // Create a read stream to read only new data (from previousStats.size to currentStats.size).
            // Search query: "Node.js stream incremental file reading"
            const incrementalStream = fileSystem.createReadStream(logFilePath, {
                // Start reading from the previous file size.
                // Search query: "Node.js stream start end position range"
                start: previousStats.size,
                // Read up to the current file size.
                end: currentStats.size,
                // Set encoding to 'utf8' for text.
                // Search query: "Node.js stream text encoding"
                encoding: 'utf8'
            });
            // Initialize a string to accumulate new data.
            // Search query: "Node.js string initialization data accumulation"
            let newFileContent = '';
            // Iterate over stream chunks to build new data.
            // Search query: "Node.js async iterator stream processing"
            for await (const contentChunk of incrementalStream) {
                // Append each chunk to newFileContent.
                // Search query: "Node.js string append chunk processing"
                newFileContent += contentChunk;
            }
            // Split new data into lines, filtering out empty lines.
            // Corner case: Empty lines are filtered out to ensure clean output.
            // Search query: "Node.js string split filter empty lines"
            const newLogLines = newFileContent.split('\n').filter(line => line.trim() !== '');
            // Add new lines to recentLogLines array.
            // Search query: "Node.js array spread operator push"
            recentLogLines.push(...newLogLines);
            // Keep only the last 10 lines if the array exceeds 10.
            // Search query: "Node.js array slice maintain size limit"
            if (recentLogLines.length > 10) {
                recentLogLines = recentLogLines.slice(-10);
            }
            // Send each new line to all connected clients.
            // Search query: "Node.js broadcast message all clients"
            newLogLines.forEach(logLine => {
                // Iterate over all client IDs and send the line via SSE.
                // Search query: "Node.js nested forEach client broadcasting"
                activeClientIds.forEach(clientId => transmitSSEMessage(clientConnectionPool[clientId], logLine));
            });
        });
    // Catch any errors during file watching and log them.
    } catch (error) {
        // Search query: "Node.js file watching error handling"
        console.error('Error monitoring log file:', error);
    }
}

// **File Monitoring (monitorLogFileChanges):
// Calls fetchRecentLogLines to initialize recentLogLines.
// Uses fileSystem.watchFile to poll test.txt every 100ms for changes.
// When the file grows (currentStats.size > previousStats.size), reads only new data using a stream (start: previousStats.size, end: currentStats.size).
// Splits new data into lines, updates recentLogLines (keeping only the last 10), and sends new lines to all clients via transmitSSEMessage.**

// Define the SSE handler for /log endpoint.
// Search query: "Node.js SSE connection handler implementation"
const streamLogHandler = (request, response) => {
    // Handle client disconnection to clean up resources.
    // Search query: "Node.js client disconnect event handling"
    request.on('close', () => {
        // Log disconnection with the client's ID.
        // Search query: "Node.js client disconnection logging"
        console.log('SSE client disconnected:', request.connectionId);
        // Remove the client's ID from activeClientIds array.
        // Search query: "Node.js array filter remove element"
        activeClientIds = activeClientIds.filter(clientId => clientId !== request.connectionId);
        // Remove the client's response object from clientConnectionPool.
        // Search query: "Node.js object property deletion"
        delete clientConnectionPool[request.connectionId];
        // End the response to close the connection.
        // Search query: "Node.js response end connection close"
        response.end();
    });

    // Log new client connection for debugging.
    // Search query: "Node.js client connection logging"
    console.log('New /log endpoint request');
    // Set HTTP headers for SSE.
    // Search query: "Node.js SSE HTTP headers configuration"
    response.writeHead(200, {
        // Set content type to text/event-stream for SSE.
        // Search query: "SSE content type header specification"
        'Content-Type': 'text/event-stream',
        // Disable caching to ensure real-time updates.
        // Search query: "Node.js cache control headers"
        'Cache-Control': 'no-cache',
        // Keep the connection open for continuous updates.
        // Search query: "Node.js keep alive connection header"
        'Connection': 'keep-alive'
    });

    // Send the last 10 lines to the new client.
    // Search query: "Node.js SSE initial data transmission"
    sendHistoricalLines(response);
    // Assign a unique ID to the request using the current timestamp.
    // Search query: "Node.js unique identifier generation timestamp"
    request.connectionId = Date.now();
    // Add the client's ID to activeClientIds array.
    // Search query: "Node.js array push element addition"
    activeClientIds.push(request.connectionId);
    // Store the response object in clientConnectionPool for sending updates.
    // Search query: "Node.js object property assignment storage"
    clientConnectionPool[request.connectionId] = response;
    // Log the total number of connected clients.
    // Search query: "Node.js array length client count logging"
    console.log('Total active clients:', activeClientIds.length);
};

// **SSE Handler (streamLogHandler):
// Sets up an SSE connection with appropriate headers (text/event-stream, no-cache, keep-alive).
// Sends the last 10 lines to the new client.
// Assigns a unique ID to the client, stores it in activeClientIds, and saves the response object in clientConnectionPool.
// Handles client disconnection by removing the client's ID and response from activeClientIds and clientConnectionPool.
// Logs connection and disconnection events for debugging.**

// Start watching the file immediately when the module is loaded.
// Search query: "Node.js module initialization function call"
monitorLogFileChanges();

// Export the streamLogHandler function for use in server.js.
// Search query: "Node.js module exports object destructuring"
module.exports = { streamLogHandler };

// **Corner Cases:
// "If the file is empty or doesn't exist, recentLogLines is set to empty."
// "If the file shrinks, updates are skipped (currentStats.size <= previousStats.size)."
// "Empty lines are filtered out to ensure clean output."**