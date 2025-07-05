declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        rid: number;
        auth: number[];
      };
    }
  }
}

// This export is needed to make the file a module
export {};

// ! to make the file a module and avoid the TypeScript error
// export {};

// src/types/express.d.ts
// declare module 'express' {
//   interface Request {
//     user?: {
//       id: number;
//       name: string;
//     };
//   }
// }
