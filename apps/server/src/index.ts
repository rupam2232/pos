// This is the entry point of the application. It loads environment variables, connects to the database, and starts the server.
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import { setupSocketIO } from "./socket/index.js";

// Load environment variables from .env file
dotenv.config({
  path: "./.env",
});

// Create an HTTP server using the Express app
const server = http.createServer(app);

// This function initializes Socket.IO and sets up the connection event
setupSocketIO(server);

// Connect to the MongoDB database
connectDB()
  .then(() => {
    // Listen for application-level errors
    app.on("error", (err) => {
      console.log("ERROR: ", err);
      throw err;
    });
    // Start the Express server on the specified port
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    // Log and handle database connection errors
    console.log("MongoDB connection Failed: ", err);
  });