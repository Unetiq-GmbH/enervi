import axios from "axios";
import { Request, Response } from "express";
import getGPUServerHeaders from "../../helpers/getGPUServerHeaders";
import getGPUServerURL from "../../utils/getGPUServerURL";

const checkServerStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let URL = getGPUServerURL();
  URL = URL + "/check_status";
  const flaskResponse = await axios.get(URL, getGPUServerHeaders());
  if (flaskResponse.status !== 200) {
    return res.status(500).send("Error in manipulation");
  } else {
    return res.send("Image in queue for manipulation");
  }
};

export default checkServerStatus;
