import sql from '../config/db';

export interface IUser {
  UserId?: number;
  Username: string;
  Email: string;
  Phone?: string;
  PasswordHash: string;
  IsActive?: boolean;
  IsLocked?: boolean;
  FailedLoginAttempts?: number;
  LockoutUntil?: Date | null;
  LastLoginAt?: Date | null;
  IsDeleted?: boolean;
  CreatedAt?: Date;
  CreatedBy?: string | null;
  UpdatedAt?: Date;
  UpdatedBy?: string | null;
}

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  const result = await sql.query`SELECT * FROM UserLogin WHERE Email = ${email} AND IsDeleted = 0`;
  return result.recordset[0] || null;
};

export const findUserByUsername = async (username: string): Promise<IUser | null> => {
  const result = await sql.query`SELECT * FROM UserLogin WHERE Username = ${username} AND IsDeleted = 0`;
  return result.recordset[0] || null;
};

export const createUser = async (user: IUser): Promise<number> => {
  const result = await sql.query`
    INSERT INTO UserLogin (Username, Email, Phone, PasswordHash, IsActive, IsLocked, FailedLoginAttempts, IsDeleted, CreatedAt, UpdatedAt)
    VALUES (${user.Username}, ${user.Email}, ${user.Phone || null}, ${user.PasswordHash}, ${user.IsActive ?? 1}, ${user.IsLocked ?? 0}, ${user.FailedLoginAttempts ?? 0}, ${user.IsDeleted ?? 0}, GETDATE(), GETDATE());
    SELECT SCOPE_IDENTITY() AS UserId;
  `;
  return result.recordset[0].UserId;
};
