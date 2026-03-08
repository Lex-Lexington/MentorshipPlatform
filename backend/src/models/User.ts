/**
 * User Model / Interface
 * Represents a user on the IT Mentorship Platform.
 */
export type UserRole = 'mentor' | 'mentee';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  skills: string[];
  bio: string;
}

export class User implements IUser {
  public id: string;
  public name: string;
  public email: string;
  public password: string;
  public role: UserRole;
  public skills: string[];
  public bio: string;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    role: UserRole,
    skills: string[],
    bio: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.skills = skills;
    this.bio = bio;
  }

  /**
   * Returns a safe representation of the user (without password).
   */
  public toSafeObject(): Omit<IUser, 'password'> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      skills: this.skills,
      bio: this.bio,
    };
  }
}
