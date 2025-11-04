import { Router } from 'express';
import { getPostsPage, getMorePosts, getPublishPage, publishRequest, likeRequest, deleteRequest } from '../controllers/pagesController.js'; 
import { isAuthenticated } from '../middlewares/auth.js'

const router = Router();

router.get('/', isAuthenticated, getPostsPage);

router.get('/api/posts', isAuthenticated, getMorePosts);

router.get('/publish', isAuthenticated, getPublishPage);
router.post('/publish', isAuthenticated, publishRequest);

router.post('/post/:id/like', isAuthenticated, likeRequest);
router.post('/post/:id/delete', isAuthenticated, deleteRequest);

export default router;