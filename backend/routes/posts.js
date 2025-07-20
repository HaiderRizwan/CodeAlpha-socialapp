const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = new Post({ user: req.user._id, content, image });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'username avatar').populate({ path: 'comments', populate: { path: 'user', select: 'username avatar' } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get post by id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username avatar').populate({ path: 'comments', populate: { path: 'user', select: 'username avatar' } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) {
      post.likes.push(req.user._id);
      await post.save();
      return res.json({ message: 'Liked post' });
    } else {
      post.likes.splice(idx, 1);
      await post.save();
      return res.json({ message: 'Unliked post' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.user.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 