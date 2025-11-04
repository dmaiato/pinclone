import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import ejs from 'ejs';
import { fetchPosts } from '../queries/postQueries.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
const VIEWS_DIR = path.join(__dirname, '..', 'views');

export const getPostsPage = async (req, res) => {
    const orderByQuery = req.query.orderBy || 'createdAt_desc';
    try {
        const { posts, totalPages } = await fetchPosts(1, orderByQuery, req.session.userId);
        res.render('home', {
            posts,
            currentPage: 1,
            totalPages,
            orderBy: orderByQuery,
            user: res.locals.user
        });
    } catch (error) {
        console.error("Error loading initial posts:", error);
        res.status(500).send("Erro ao carregar a página.");
    }
};

export const getMorePosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const orderByQuery = req.query.orderBy || 'createdAt_desc';

    if (page <= 1) {
        return res.json({ html: '', hasMore: true });
    }

    try {
        const { posts, totalPages } = await fetchPosts(page, orderByQuery, req.session.userId);

        if (!posts || posts.length === 0) {
            return res.json({ html: '', hasMore: false });
        }

        const postsHtml = await ejs.renderFile(path.join(VIEWS_DIR, 'partials', '_posts.ejs'), {
            posts,
            user: res.locals.user
        });

        res.json({
            html: postsHtml,
            hasMore: page < totalPages
        });
    } catch (error) {
        console.error("Error fetching more posts:", error);
        res.status(500).json({ error: "Erro ao carregar mais postagens." });
    }
};


export const getPublishPage = (req, res) => {
    res.render('publish');
};

export const publishRequest = (req, res, next) => {
    const form = formidable({
        uploadDir: UPLOADS_DIR,
        keepExtensions: true,
        createDirsFromUploads: true,
        filename: (name, ext) => `post_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Form parsing error:", err);
            return next(err);
        }

        const title = fields.title?.[0] || 'Sem Título';
        const description = fields.description?.[0] || '';
        const link = fields.link?.[0] || '';
        const imageFile = files.imagem?.[0];

        if (!imageFile) {
            return res.status(400).send("Nenhuma imagem enviada.");
        }

        const imageUrl = imageFile.newFilename;

        try {
            await prisma.post.create({
                data: { title, description, link, imageUrl, authorId: req.session.userId }
            });
            res.redirect('/');
        } catch (error) {
            console.error("Error saving post:", error);
            res.status(500).send("Erro ao salvar a postagem.");
        }
    });
};

export const likeRequest = async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.session.userId;

    if (isNaN(postId)) {
        return res.status(400).send("ID do post inválido.");
    }

    try {
        await prisma.$transaction(async (tx) => {
            const existingLike = await tx.like.findUnique({
                where: { userId_postId: { userId, postId } }
            });

            if (existingLike) {
                await tx.like.delete({ where: { id: existingLike.id } });
            } else {
                await tx.like.create({ data: { userId, postId } });
            }
        });
        res.redirect(req.get('Referer') || '/');
    } catch (error) {
        console.error("Error processing like:", error);
        res.status(500).send("Erro ao processar o like.");
    }
};

export const deleteRequest = async (req, res) => {
    const postId = parseInt(req.params.id);
    const loggedInUser = res.locals.user;

    if (isNaN(postId)) {
        return res.status(400).send("ID do post inválido.");
    }

    try {
        await prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: { id: postId },
                select: { authorId: true, imageUrl: true }
            });

            if (!post) {
                throw { status: 404, message: "Post não encontrado." };
            }

            if (post.authorId !== loggedInUser.id) {
                throw { status: 403, message: "Você não tem permissão para excluir este post." };
            }

            await tx.post.delete({ where: { id: postId } });

            const imagePath = path.join(UPLOADS_DIR, post.imageUrl);
            await fs.unlink(imagePath);
        });

        res.redirect(req.get('Referer') || '/');
    } catch (error) {
        if (error.status) {
            return res.status(error.status).send(error.message);
        }
        console.error("Erro ao excluir post:", error);
        res.status(500).send("Erro ao excluir o post.");
    }
};