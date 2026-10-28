import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import setupSocket from "./app/middleware/socket";
import logRoute from "./app/middleware/logRoute";
import setupUserRoutes from "./app/routes/user.router";
import setupImageRoutes from "./app/routes/image.router";
import setupPinRoutes from "./app/routes/pin.router";
import setupShortRoutes from "./app/routes/short.router";
import { version as versionno } from "./package.json";
import bridgeEventsToSocket from "./app/middleware/socket/bridgeEventToSockets";
import scheduleOldImagesDeletion from "./app/schedulers/oldImagesDeletion";
import("./app/database");

const app: Express = express();
const PORT: string | number = process.env.PORT || 5001;

app.use(cors());
app.use(logRoute);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static("build"));

// Routes
setupImageRoutes(app);
setupUserRoutes(app);
setupPinRoutes(app);
setupShortRoutes(app);

app.get("/api", (req: Request, res: Response) =>
  res.send({
    title: "Welcome to Enervi Backend",
    environment: process.env.NODE_ENV,
    version: versionno,
  })
);

// catch rest of the routes and serve index.html
app.all("*", (_req, res) => {
  try {
    res.sendFile(__dirname + "/build/index.html");
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

const { server, io } = setupSocket(app);

bridgeEventsToSocket(io);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}.`);
});

scheduleOldImagesDeletion();

export default app;
