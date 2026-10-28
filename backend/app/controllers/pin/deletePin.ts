import pinService from "../../services/pinService";
import { Request, Response } from "express";
import { Types } from "mongoose";

const deletePin = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(id);
    } catch (error) {
      res.status(400).json({
        error: "Invalid ID provided.",
      });
      return;
    }
    const pin = await pinService.deletePin(objectId);

    res.json(pin);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message || "An error occurred while deleting the Pin.",
    });
  }
};

export default deletePin;
