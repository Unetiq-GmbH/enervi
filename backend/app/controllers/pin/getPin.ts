import { PinModel } from "../../database/pins/pins.model";
import { Request, Response } from "express";

const getPin = async (req: Request, res: Response): Promise<void> => {
  const { lat, lng } = req.query;
  try {
    const pin = await PinModel.findOne({
      latlng: {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
      },
    })
      .populate("address creator")
      .exec();

    res.json(pin);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message || "An error occurred while fetching the Pin.",
    });
  }
};

export default getPin;
