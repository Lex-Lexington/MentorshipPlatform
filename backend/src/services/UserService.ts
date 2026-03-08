import { v4 as uuidv4 } from 'uuid';
import { User, IUser, UserRole } from '../models';

/**
 * UserService — handles all data operations for Users.
 * Currently uses an in-memory array as a mock database.
 */
export class UserService {
  private users: User[] = [];

  constructor() {
    this.seed();
  }

  /**
   * Seeds the in-memory store with sample data.
   */
  private seed(): void {
    const sampleUsers: Omit<IUser, 'id'>[] = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'hashed_pw_1',
        role: 'mentor',
        skills: ['react', 'typescript', 'node.js'],
        bio: 'Senior frontend engineer with 8 years of experience in building scalable web applications.',
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'hashed_pw_2',
        role: 'mentor',
        skills: ['python', 'machine-learning', 'django'],
        bio: 'ML engineer passionate about mentoring newcomers into data science.',
      },
      {
        name: 'Carol Williams',
        email: 'carol@example.com',
        password: 'hashed_pw_3',
        role: 'mentor',
        skills: ['react', 'vue', 'css', 'figma'],
        bio: 'Full-stack developer and UI/UX enthusiast. Love helping juniors level up.',
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        password: 'hashed_pw_4',
        role: 'mentee',
        skills: ['html', 'css', 'javascript'],
        bio: 'Aspiring frontend developer looking for guidance on modern frameworks.',
      },
      {
        name: 'Eva Martinez',
        email: 'eva@example.com',
        password: 'hashed_pw_5',
        role: 'mentor',
        skills: ['java', 'spring-boot', 'microservices', 'docker'],
        bio: 'Backend architect specializing in enterprise Java applications and cloud-native design.',
      },
      {
        name: 'Frank Lee',
        email: 'frank@example.com',
        password: 'hashed_pw_6',
        role: 'mentee',
        skills: ['python', 'flask'],
        bio: 'Junior developer eager to learn best practices and grow in backend engineering.',
      },
    ];

    this.users = sampleUsers.map(
      (u) => new User(uuidv4(), u.name, u.email, u.password, u.role, u.skills, u.bio)
    );
  }

  /**
   * Returns all users, with optional filtering by role and skills.
   */
  public getAll(filters?: { role?: UserRole; skills?: string }): Omit<IUser, 'password'>[] {
    let result = [...this.users];

    if (filters?.role) {
      result = result.filter((u) => u.role === filters.role);
    }

    if (filters?.skills) {
      const skillList = filters.skills
        .split(',')
        .map((s) => s.trim().toLowerCase());

      result = result.filter((u) =>
        skillList.some((skill) =>
          u.skills.map((s) => s.toLowerCase()).includes(skill)
        )
      );
    }

    return result.map((u) => u.toSafeObject());
  }

  /**
   * Find a single user by ID.
   */
  public findById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }
}
