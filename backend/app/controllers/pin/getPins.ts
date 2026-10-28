import { PinModel } from "../../database/pins/pins.model";
import { Request, Response } from "express";

const getPins = async (req: Request, res: Response): Promise<void> => {
  try {
    const pinsWithShorts = await PinModel.aggregate([
      {
        $lookup: {
          from: "shorts",
          localField: "_id",
          foreignField: "pin",
          as: "shorts",
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "address",
          foreignField: "_id",
          as: "address",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
        },
      },
      { $unwind: "$address" },
      { $unwind: "$creator" },
    ]);

    res.json(pinsWithShorts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message || "An error occurred while fetching Pins.",
    });
  }
};

export default getPins;
