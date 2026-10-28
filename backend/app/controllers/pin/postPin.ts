import pinService from "../../services/pinService";
import { Request, Response } from "express";
import { IPostPin } from "../../database/pins/pins.types";

const postPin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).send({
        message: "Request body can not be empty.",
      });
      return;
    }

    const data = req.body.data;
    const pinData: IPostPin = {
      _id: data._id,
      latlng: data.latlng,
      name: data.name,
      address: {
        ...data.address,
        ...(data.address.postCode && {
          postCode: parseInt(data.address.postCode, 10),
        }),
      },
      description: data.description,
      creator: data.creator,
      markerIconType: data.markerIconType,
    };

    if (!pinData.latlng) {
      res.status(400).send({
        message: "Missing lattitude or longitude.",
      });

      return;
    }

    const pin = await pinService.postPin(pinData);

    res.json(pin);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message || "An error occurred while posting the Pin.",
    });
  }
};

export default postPin;
