declare module "express-serve-static-core" {
  export interface Request {
    query?: string; //or can be anything
    params?: string;
  }
}
