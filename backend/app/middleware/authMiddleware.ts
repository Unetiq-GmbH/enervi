import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { GetVerificationKey } from "express-jwt";
import { RequestHandler } from "express";
import dotenv from "dotenv";

dotenv.config();

const authConfig = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
};

if (!authConfig.domain || !authConfig.audience) {
  throw new Error(
    "Auth0 domain and audience must be set in environment variables"
  );
}

const jwtMiddleware: RequestHandler = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
    handleSigningKeyError: (err, cb) => {
      console.error("Error getting signing key", err);
      return cb(err);
    },
  }) as GetVerificationKey,
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

export default jwtMiddleware;
