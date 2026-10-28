import { UserModel } from "../../database/users/users.model";
import { Request, Response } from "express";
import { ControllerResponse } from "../../types";

const getUserByEmail = async (
  req: Request,
  res: Response
): ControllerResponse => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({
      error: "Missing email parameter.",
    });
  }

  try {
    const user = await UserModel.findOne({
      email: email as string,
    })
      .populate("role")
      .exec();

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        (error as Error).message ||
        "An error occurred while fetching the user.",
    });
  }
};

export default getUserByEmail;
