import eventEmitter from "../../middleware/event";
import SocketEvents from "../../middleware/socket/socketEvents";
import { ManipulatedImageModel } from "../../database/manipulatedImages/manipulatedImages.model";
import { Request, Response } from "express";

async function processFailure(req: Request, res: Response): Promise<Response> {
  const { imageManipulationUUID } = req.params;

  await ManipulatedImageModel.findOneAndUpdate(
    { uuid: imageManipulationUUID },
    { inProcess: false, error: true }
  );

  eventEmitter.emit(
    SocketEvents.imageManipulationFailed,
    imageManipulationUUID
  );

  return res.status(200).send("OK");
}

export default processFailure;
