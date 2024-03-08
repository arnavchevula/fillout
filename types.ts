declare global {
  namespace Express {
    interface Request {
      query: string; //or can be anything
      params: string;
    }
  }
}
