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
  resetToken?: string | null;
  resetTokenExpiry?: number | null;
}

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  const result = await sql.query`
    SELECT * FROM UserLogin WHERE Email = ${email} AND IsDeleted = 0
  `;
  return result.recordset[0] || null;
};

export const findUserByUsername = async (username: string): Promise<IUser | null> => {
  const result = await sql.query`
    SELECT * FROM UserLogin WHERE Username = ${username} AND IsDeleted = 0
  `;
  return result.recordset[0] || null;
};

export const createUser = async (user: IUser): Promise<number> => {
  const result = await sql.query`
    INSERT INTO UserLogin 
      (Username, Email, Phone, PasswordHash, IsActive, IsLocked, FailedLoginAttempts, IsDeleted, CreatedAt, UpdatedAt)
    VALUES 
      (${user.Username}, ${user.Email}, ${user.Phone || null}, ${user.PasswordHash}, 
       ${user.IsActive ?? 1}, ${user.IsLocked ?? 0}, 
       ${user.FailedLoginAttempts ?? 0}, ${user.IsDeleted ?? 0}, 
       GETDATE(), GETDATE());
    SELECT SCOPE_IDENTITY() AS UserId;
  `;
  return result.recordset[0].UserId;
};

export const updateUserById = async (
  userId: number,
  updates: Partial<IUser>
): Promise<void> => {
  const request = new sql.Request();
  const setClauses: string[] = [];

  if (updates.PasswordHash !== undefined) {
    setClauses.push('PasswordHash = @PasswordHash');
    request.input('PasswordHash', sql.NVarChar, updates.PasswordHash);
  }

  if (updates.resetToken !== undefined) {
    setClauses.push('resetToken = @resetToken');
    request.input('resetToken', sql.NVarChar, updates.resetToken);
  }

  if (updates.resetTokenExpiry !== undefined) {
    setClauses.push('resetTokenExpiry = @resetTokenExpiry');
    request.input('resetTokenExpiry', sql.BigInt, updates.resetTokenExpiry);
  }

  if (setClauses.length === 0) return;

  request.input('UserId', sql.Int, userId);

  const query = `
    UPDATE UserLogin
    SET ${setClauses.join(', ')}, UpdatedAt = GETDATE()
    WHERE UserId = @UserId AND IsDeleted = 0
  `;

  await request.query(query);
};

