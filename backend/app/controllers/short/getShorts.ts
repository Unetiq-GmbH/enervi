import { ShortModel } from "../../database/shorts/shorts.model";
import shortService from "../../services/shortService";
import { Request, Response } from "express";

const getShorts = async (req: Request, res: Response): Promise<void> => {
  const { housingCondition, postCode } = req.query;
  try {
    const shorts = await ShortModel.find()
      .populate({
        path: "pin",
        populate: {
          path: "address",
          model: "Address",
        },
      })
      .exec();

    if (housingCondition && typeof housingCondition !== "string") {
      throw new Error("housingCondition must be a string");
    }

    if (postCode && typeof postCode !== "string") {
      throw new Error("postCode must be a string");
    }

    const sortedShorts = shortService.sortByHousingConditionAndPostCode({
      shorts,
      housingCondition,
      ...(postCode && { postCode: parseInt(postCode) }),
    });

    res.json(sortedShorts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message || "An error occurred while fetching Shorts.",
    });
  }
};

export default getShorts;
