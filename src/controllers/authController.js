import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getSignupPage = (req, res) => {
    res.render('signup');
};

export const getLoginPage = (req, res) => {
    res.render('login');
};

export const logoutRequest = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Could not log out. Please try again.");
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

export const signupRequest = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send("Name, email, and password are required.");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        res.redirect('/login');
    } catch (error) {
        console.error("Signup Error:", error);
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(409).send("This email is already in use.");
        }
        res.status(500).send("Error creating user.");
    }
};

export const loginRequest = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).send("Invalid email or password.");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user.id;
            return res.redirect('/');
        } else {
            return res.status(401).send("Invalid email or password.");
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Server error during login.");
    }
};