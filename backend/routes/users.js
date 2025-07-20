const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password').populate('followers following', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a user
router.post('/:username/follow', auth, async (req, res) => {
  try {
    const toFollow = await User.findOne({ username: req.params.username });
    if (!toFollow) return res.status(404).json({ message: 'User not found' });
    if (toFollow._id.equals(req.user._id)) return res.status(400).json({ message: 'Cannot follow yourself' });
    if (toFollow.followers.includes(req.user._id)) return res.status(400).json({ message: 'Already following' });
    toFollow.followers.push(req.user._id);
    req.user.following.push(toFollow._id);
    await toFollow.save();
    await req.user.save();
    res.json({ message: 'Followed user' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.post('/:username/unfollow', auth, async (req, res) => {
  try {
    const toUnfollow = await User.findOne({ username: req.params.username });
    if (!toUnfollow) return res.status(404).json({ message: 'User not found' });
    toUnfollow.followers = toUnfollow.followers.filter(f => !f.equals(req.user._id));
    req.user.following = req.user.following.filter(f => !f.equals(toUnfollow._id));
    await toUnfollow.save();
    await req.user.save();
    res.json({ message: 'Unfollowed user' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 