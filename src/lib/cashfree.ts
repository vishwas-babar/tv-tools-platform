import { Cashfree, CFEnvironment } from "cashfree-pg";

const environment =
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

const cashfree = new Cashfree(
  environment,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_SECRET_KEY!
);

export { cashfree };
