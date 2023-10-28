export interface IUserDb {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  passwordHash: string;
}

export interface IUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  passwordHash: string;
}
