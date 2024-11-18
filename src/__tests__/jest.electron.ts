import path from "path";

export const app = {
  getPath: jest.fn().mockReturnValue(path.join(process.cwd(), '.test')),
};
