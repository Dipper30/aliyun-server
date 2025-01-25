declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number;
        [key: string]: any;
      };
    }
  }
}

// ! to make the file a module and avoid the TypeScript error
export {};
