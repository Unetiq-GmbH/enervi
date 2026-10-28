import { PinModel } from "../../database/pins/pins.model";
import axios from "axios";
import { Request, Response } from "express";

const searchPin = async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;
  try {
    const params = {
      q: req.query.q,
      format: "json",
    };

    const pins = await PinModel.aggregate([
      {
        $lookup: {
          from: "addresses",
          localField: "address",
          foreignField: "_id",
          as: "address",
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: new RegExp(q as string, "i") } },
            { "address.street": { $regex: new RegExp(q as string, "i") } },
            { "address.city": { $regex: new RegExp(q as string, "i") } },
            { "address.postCode": { $regex: new RegExp(q as string, "i") } },
          ],
        },
      },
    ]);

    let response = [];
    if (pins.length > 0) {
      response = pins;
    } else {
      const openStreetMapRes = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params,
        }
      );
      response = openStreetMapRes.data;
    }

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message || "An error occurred while posting the Pin.",
    });
  }
};

export default searchPin;
