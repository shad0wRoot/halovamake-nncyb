import { IUser } from "../models/User";

declare global {
   namespace Express {
      // This makes req.user typed as IUser everywhere in your app
      interface User extends IUser {}
   }
}
