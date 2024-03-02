import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { createServer } from "http";
import { Server } from "socket.io";

// ...

// routers
import jobRouter from "./routes/jobRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import companyRouter from "./routes/companyRouter.js";
import cleanersRouter from "./routes/cleannerRouter.js";
import categoryRouter from "./routes/admin/categoryRouter.js";
import addOnRouter from "./routes/admin/addOnRouter.js";

import orderRouter from "./routes/orderRouter.js";
// public
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

// middleware
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import { authenticateUser } from "./middleware/authMiddleware.js";
import { getLandingCategories } from "./controllers/userController.js";
const httpServer = createServer(app);
const io = new Server(httpServer);
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static(path.resolve(__dirname, "./client/dist")));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(mongoSanitize());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/v1/test", (req, res) => {
  res.json({ msg: "test route" });
});

app.use("/api/v1/jobs", authenticateUser, jobRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/cleaners", cleanersRouter);
app.use("/api/v1/users", authenticateUser, userRouter);
app.use("/api/v1/auth", authRouter);
//app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin/add-on", addOnRouter);
app.use("/api/v1/admin/category", categoryRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/dist", "index.html"));
});

app.use("*", (req, res) => {
  res.status(404).json({ msg: "not found" });
});

app.use(errorHandlerMiddleware);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
const serverport = process.env.SERVERPORT || 5100;
const port = process.env.PORT || 5200;

httpServer.listen(serverport, () => {
  console.log(`server running on PORT ${serverport}...`);
});

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server running on PORT ${port}...`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
export { io };
