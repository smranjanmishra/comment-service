// Import the Node.js 'fs' module for file system operations.
// Search query: "Node.js fs module file writing operations"
const fileSystem = require('fs');

// Initialize a counter variable to track log entry numbers starting from 101.
// Search query: "Node.js variable initialization counter"
let logEntryCounter = 101;
// Create an interval timer to generate log entries every 1000 milliseconds (1 second).
// Search query: "Node.js setInterval timer function"
setInterval(() => {
    // Append a new log entry to the test.txt file with current counter value.
    // Search query: "Node.js fs appendFileSync file writing"
    fileSystem.appendFileSync('./test.txt', `log entry: ${logEntryCounter}\n`);
    // Log to console that a new entry has been written for debugging purposes.
    // Search query: "Node.js console log debugging output"
    console.log(`Generated log entry: ${logEntryCounter}`);
    // Increment the counter for the next log entry.
    // Search query: "Node.js variable increment operation"
    logEntryCounter++;
}, 1000);