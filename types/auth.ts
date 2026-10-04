export type UserRole =
  | 'Question Setter'
  | 'Reviewer'
  | 'Examination Authority'
  | 'Examination Center'
  | 'Admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
}
