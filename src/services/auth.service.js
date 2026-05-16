import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import logger from "#config/logger.js";
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';


export const hashPassword = async (password) => {
    // Implement password hashing logic here (e.g., using bcrypt)
    try {
        return await bcrypt.hash(password, 10);
    }
    catch (error) {
        logger.error('Error hashing password:', error);
        throw new Error('Error hashing password');
    }
}


export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    }
    catch (error) {
        logger.error('Error comparing password:', error);
        throw new Error('Error comparing password');
    }
}
export const createUser = async ({ name, email, password, role = 'user' }) => {
    // Implement user creation logic here
    try {

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length > 0) {
            throw new Error('User already exists');
        }

        const hashedPassword = await hashPassword(password);
        // Replace the following with actual user creation logic

        const [newUser] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            role,
            created_at: new Date(),
            updated_at: new Date()
        }).returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            created_at: users.created_at,
        });

        logger.info(`User created successfully: ${email}`);

        return newUser;
    } catch (error) {
        logger.error('Error creating user:', error);
        throw new Error('Error creating user');
    }
};
export const authenticateUser = async (email, password) => {
    try {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        return user;
    } catch (error) {
        if (error.message === 'User not found' || error.message === 'Invalid credentials') {
            throw error;
        }

        logger.error('Error authenticating user:', error);
        throw new Error('Error authenticating user');
    }
}
