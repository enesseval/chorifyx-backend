import { Types } from "mongoose";

export interface IUser {
   name: string;
   surname: string;
   email: string;
   password: string;
   createdAt: Date;
   updatedAt: Date;
   status: boolean;
   verificationCode?: string;
   verificationExpiry?: Date;
   verifyCodeLimit: number;
   refreshToken: string | null;
}

// create user interface
export interface IUserCreate {
   name: string;
   surname: string;
   email: string;
   password: string;
}

// read user interface
export interface IUserResponse {
   id: string;
   name: string;
   surname: string;
   email: string;
   status: boolean;
}

// login user interface
export interface IUserLogin {
   email: string;
   password: string;
}

// login response interface
export interface ILoginResponse {
   user: IUserResponse;
   token: string;
}