const router = require('express').Router();
const withAuth = require('../mw/auth');
const { User, Post, Comment } = require('../models');

// /
// GET: returns the login page
// POST: adds your blog post

// router.get('/', withAuth, async (req, res) => {

router.get('/', async (req, res) => {
    res.render('new-post')
});

router.post('/', async (req, res) => {
    try {
        const newPost = await Post.create({
            title: req.body.title,
            description: req.body.description,
            user_id: 1,
        });
        // console.log(req.body);
        res.status(200).json(newPost);
    } catch (err) {
        res.status(500).json(err);
    }
});


// /:id
// GET: gets post by ID and brings its comments along
// POST: adds a comment

router.get('/:id', async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['username'],
                },
                {
                    model: Comment,
                    attributes: ['body', 'date_created'],
                    include: [
                        {
                            model: User,
                            attributes: ['username'],
                        },
                    ],
                },
            ],
        });
        const post = postData.get({ plain: true });
        
        // console.log(post);
        res.render('post', {post})
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;