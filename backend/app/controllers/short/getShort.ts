import { ShortModel } from "../../database/shorts/shorts.model";
import { Request, Response } from "express";

const getShort = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.query;
  try {
    const short = await ShortModel.findById(id)
      .populate({
        path: "pin",
        populate: {
          path: "address",
          model: "Address",
        },
      })
      .exec();

    res.json(short);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message ||
        "An error occurred while fetching the Short.",
    });
  }
};

export default getShort;
