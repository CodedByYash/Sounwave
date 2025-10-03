import express from "express";
import roomRoutes from "./rooms";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/rooms", roomRoutes);
export default router;
