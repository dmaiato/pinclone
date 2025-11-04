import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userHydration = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.session.userId },
                select: { id: true, name: true, email: true }
            });
            res.locals.user = user;
        } catch (error) {
            console.error("Error fetching user for session: ", error);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};