import logger from "#config/logger.js";
import { formatValidationErrors } from "#utils/format.js";
import { signInSchema, signUpSchema } from "#validations/auth.validation.js";
import { authenticateUser, createUser } from "#services/auth.service.js";
import { jwtToken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";

export const signup = async (req, res, next) => {
    try {
        const validationResult = signUpSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({ error: 'Validation failed', details: formatValidationErrors(validationResult.error) });
        }

        const { name, email, role } = validationResult.data;


        const user = await createUser({ name, email, password: validationResult.data.password, role });

        const token = jwtToken.sign({ userId: user.id, email: user.email, role: user.role });

        cookies.set(res, 'token', token)

        logger.info(`User registered successfully: ${email}`);

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        logger.error('Error during registration:', error);

        if (error.message.includes('User already exists')) {
            return res.status(409).json({ message: 'User already exists' });
        }

        next(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const validationResult = signInSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({ error: 'Validation failed', details: formatValidationErrors(validationResult.error) });
        }

        const { email, password } = validationResult.data;
        const user = await authenticateUser(email, password);

        const token = jwtToken.sign({ userId: user.id, email: user.email, role: user.role });

        cookies.set(res, 'token', token);

        logger.info(`User logged in successfully: ${email}`);

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Error during login:', error);

        if (error.message.includes('User not found') || error.message.includes('Invalid credentials')) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        next(error);
    }
}

export const signOut = async (req, res, next) => {
    try {
        cookies.clear(res, 'token');

        logger.info('User logged out successfully');

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        logger.error('Error during logout:', error);
        next(error);
    }
}
