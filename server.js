const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes");

const { connectDB } = require("./config/database");
const { initializeEmailTransporter } = require("./config/email");

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: true,
  })
);

initializeEmailTransporter();
connectDB();

// Temporary block middleware
app.use((req, res, next) => {
  res.status(503).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Unavailable</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

        body {
          margin: 0;
          padding: 0;
          font-family: 'Roboto', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f5f5f5;
          color: #333;
        }

        .container {
          text-align: center;
          background: #ffffff;
          padding: 50px;
          border-radius: 15px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          max-width: 600px;
        }

        h1 {
          font-size: 2.8rem;
          margin-bottom: 15px;
          color: #d9534f; /* Warning/red color */
        }

        p {
          font-size: 1.2rem;
          margin-bottom: 30px;
        }

        .emoji {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .details {
          font-size: 0.95rem;
          color: #666;
        }

        @media (max-width: 600px) {
          h1 { font-size: 2rem; }
          p { font-size: 1rem; }
          .details { font-size: 0.85rem; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2ZYtHv2OLXmthRPbkmENZRXuqBVDwlsrZ1A&s" alt="Construction Sign Emoji" />
        </div>
        <p>Our servers are currently experiencing high database load and limited storage capacity.</p>
        <p class="details">We are actively working to restore full service. Please try again in a few minutes.</p>
      </div>
    </body>
    </html>
  `);
});

app.use("/api", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("<h1>Server is running for anondolok</h1>");
});

module.exports = app;
