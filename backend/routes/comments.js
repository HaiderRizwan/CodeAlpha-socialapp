const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// Add a comment to a post
router.post('/:postId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = new Comment({ user: req.user._id, post: post._id, content });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (!comment.user.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
    await comment.deleteOne();
    // Remove from post.comments
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 