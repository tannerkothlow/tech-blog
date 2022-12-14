const router = require('express').Router();
const withAuth = require('../mw/auth');
const { User, Post, Comment } = require('../models');

// /
// GET: returns the login page
// POST: adds your blog post

// router.get('/', withAuth, async (req, res) => {

router.get('/', withAuth, async (req, res) => {
    res.render('new-post')
});

router.post('/', async (req, res) => {
    try {
        const newPost = await Post.create({
            title: req.body.title,
            description: req.body.description,
            user_id: req.session.user_id,
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
// PUT: updates post with same id

router.get('/:id', async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username'],
                },
                {
                    model: Comment,
                    attributes: ['id', 'body', 'date_created'],
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
        // Shows the latest comments first
        // post.comments.reverse();

        if (post.user.id == req.session.user_id) {
            console.log(`This post belongs to the logged in user!`)

            const belongsToUser = true;
            res.render('post', {post, belongsToUser});
            return;
        } else {
            res.render('post', {post});
            return;
        };
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/:id', withAuth, async (req, res) => {
    try {
        const commentData = await Comment.create({
            body: req.body.body,
            user_id: req.session.user_id,
            post_id: Number(req.params.id),
        });
        res.status(200).json(commentData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const userPost = await Post.findByPk(req.params.id);
        console.log(userPost);
        userPost.update({
            title: req.body.title,
            description: req.body.description,
        });
        res.status(200).json(userPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Option can only appear if a logged in user is viewing their own post
// ...or if someone connects to the server using Insomnia, so it's not very secure.
// Add confirmation at the front end

router.delete('/:id', async (req, res) => {
    try {
        const deletePost = await Post.destroy({
            where: {
                id: req.params.id,
            },
        });

        res.status(204).json(deletePost);
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router;