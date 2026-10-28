import jwt from "jsonwebtoken";

export default function getGPUServerHeaders() {
  const key = process.env.EXPRESS_FLASK_KEY;
  if (!key) {
    throw new Error("EXPRESS_FLASK_KEY is not defined");
  }
  const token = jwt.sign({ sub: "express-js" }, key);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
