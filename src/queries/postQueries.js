import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const POSTS_PER_PAGE = 10;

export const fetchPosts = async (page, orderByQuery, userId) => {
    const skip = (page - 1) * POSTS_PER_PAGE;

    const orderByOptions = {
        'likes_desc': { likes: { _count: 'desc' } },
        'createdAt_desc': { createdAt: 'desc' },
    };
    const orderBy = orderByOptions[orderByQuery] || orderByOptions['createdAt_desc'];

    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    const posts = await prisma.post.findMany({
        skip,
        take: POSTS_PER_PAGE,
        orderBy,
        include: {
            author: { select: { name: true, email: true, id: true } },
            _count: { select: { likes: true } },
            likes: userId ? { where: { userId } } : false,
        }
    });

    if (userId) {
        posts.forEach(post => {
            post.userHasLiked = post.likes.length > 0;
            delete post.likes;
        });
    }

    return { posts, totalPages, currentPage: page };
};