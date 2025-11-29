import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";
import path from "path";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // frontend origin
    // origin: "https://anuka-organic.vercel.app/", // frontend origin
    credentials: true, // allow cookies/auth headers
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
