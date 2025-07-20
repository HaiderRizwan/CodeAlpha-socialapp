import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from './api';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('token', res.data.token);
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };
  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
function useAuth() {
  return useContext(AuthContext);
}
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await require("./api").getFeed();
      setPosts(res.data);
    } catch (err) {
      setError("Failed to load posts");
    }
    setLoading(false);
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await require("./api").createPost({ content });
      setContent("");
      fetchPosts();
    } catch (err) {
      setError("Failed to create post");
    }
  }

  async function handleLike(postId) {
    try {
      await require("./api").likePost(postId);
      fetchPosts();
    } catch (err) {
      setError("Failed to like/unlike post");
    }
  }

  async function handleAddComment(postId, comment, setComment) {
    if (!comment.trim()) return;
    try {
      await require("./api").addComment(postId, { content: comment });
      setComment("");
      fetchPosts();
    } catch (err) {
      setError("Failed to add comment");
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Sidebar */}
      <aside className="hidden md:flex flex-col items-center w-64 py-8 px-4 bg-white/80 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-800 min-h-screen sticky top-0">
        <a href="/" className="mb-8 flex items-center gap-2">
          <span className="text-3xl font-extrabold text-blue-600">S</span>
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">AlphaApp</span>
        </a>
        <nav className="flex flex-col gap-4 w-full">
          <a href="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium">🏠 Home</a>
          <a href={user ? `/profile/${user.username}` : "/login"} className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium">👤 Profile</a>
        </nav>
        <div className="flex-1" />
        <div className="text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} AlphaApp</div>
      </aside>
      {/* Main Feed */}
      <main className="flex-1 flex flex-col items-center px-2 sm:px-0">
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
            <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind?" rows={3} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white font-sans text-lg resize-none bg-gray-50 dark:bg-gray-800" />
              <button type="submit" className="self-end bg-gradient-to-r from-blue-500 to-pink-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-pink-600 transition font-sans text-lg">Post</button>
              {error && <p className="text-red-500 mt-1 text-center font-medium">{error}</p>}
            </form>
          </div>
          {loading ? (
            <div className="flex justify-center items-center min-h-[30vh] text-center py-8 text-lg text-gray-500">Loading feed...</div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 text-center text-lg">No posts yet.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {posts.map(post => <PostItem key={post._id} post={post} user={user} onLike={handleLike} onAddComment={handleAddComment} />)}
            </div>
          )}
        </div>
      </main>
      {/* Right Sidebar (Suggestions) */}
      <aside className="hidden lg:flex flex-col w-72 py-8 px-4 bg-white/80 dark:bg-gray-900/80 border-l border-gray-200 dark:border-gray-800 min-h-screen sticky top-0">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">Suggestions</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300">A</span>
              <span className="text-gray-700 dark:text-gray-200">@Ali</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-200 dark:bg-pink-900 flex items-center justify-center font-bold text-pink-700 dark:text-pink-300">B</span>
              <span className="text-gray-700 dark:text-gray-200">@Rafay</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-yellow-200 dark:bg-yellow-900 flex items-center justify-center font-bold text-yellow-700 dark:text-yellow-300">C</span>
              <span className="text-gray-700 dark:text-gray-200">@Fatima</span>
            </li>
          </ul>
        </div>
        <div className="flex-1" />
        <div className="text-xs text-gray-400 mt-8">Find people to follow!</div>
      </aside>
    </div>
  );
}

const AVATAR_PLACEHOLDER = "https://ui-avatars.com/api/?name=";

function Navbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  return (
    <nav className="flex items-center gap-6 px-4 py-3 bg-gray-900 text-white shadow dark:bg-gray-950">
      <a href="/" className="text-yellow-400 font-bold text-lg hover:underline dark:text-yellow-300"></a>
      <a href="/" className="hover:underline hidden sm:inline">Feed</a>
      {user ? <a href={`/profile/${user.username}`} className="hover:underline hidden sm:inline">Profile</a> : null}
      <span className="flex-1" />
      <button onClick={() => setDark(d => !d)} className="mr-2 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition text-xs">
        {dark ? '🌙' : '☀️'}
      </button>
      {user ? (
        <span className="flex items-center gap-2">
          <img src={AVATAR_PLACEHOLDER + encodeURIComponent(user.username)} alt="avatar" className="w-7 h-7 rounded-full border border-gray-400" />
          <span className="hidden sm:inline">Hello, <span className="font-semibold">{user.username}</span>!</span>
        </span>
      ) : null}
      {user ? <button onClick={logout} className="ml-4 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition">Logout</button> : <a href="/login" className="hover:underline">Login</a>}
    </nav>
  );
}

function PostItem({ post, user, onLike, onAddComment }) {
  const [comment, setComment] = useState("");
  return (
    <div className="border border-pink-200 dark:border-pink-900 rounded-2xl p-6 bg-white/95 dark:bg-gray-900/95 shadow-xl hover:shadow-2xl transition group max-w-xl mx-auto relative overflow-hidden">
      <div className="flex items-center gap-3 mb-2">
        <img src={AVATAR_PLACEHOLDER + encodeURIComponent(post.user?.username || 'U')} alt="avatar" className="w-10 h-10 rounded-full border-2 border-blue-300 shadow" />
        <span className="font-semibold text-blue-700 dark:text-blue-300 text-lg">{post.user?.username || "Unknown"}</span>
      </div>
      <div className="my-3 text-xl text-gray-900 dark:text-gray-100 font-sans leading-relaxed">{post.content}</div>
      <div className="text-xs text-gray-400 flex items-center gap-2 mb-2">
        <span>🕒 {new Date(post.createdAt).toLocaleString()}</span>
      </div>
      <button onClick={() => onLike(post._id)} className={`mt-2 px-4 py-1.5 rounded-lg text-base font-semibold flex items-center gap-2 ${post.likes?.includes(user._id) ? 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'} hover:bg-opacity-80 transition shadow`}>
        {post.likes?.includes(user._id) ? "❤️ Unlike" : "🤍 Like"} <span>({post.likes?.length || 0})</span>
      </button>
      <div className="mt-5">
        <strong className="block mb-2 text-gray-700 dark:text-gray-300 text-base">💬 Comments:</strong>
        <div className="flex flex-col gap-2">
          {post.comments?.map(c => (
            <div key={c._id} className="border-t border-gray-100 dark:border-gray-800 py-2 text-base flex items-center gap-2">
              <img src={AVATAR_PLACEHOLDER + encodeURIComponent(c.user?.username || 'U')} alt="avatar" className="w-7 h-7 rounded-full border border-pink-200 shadow" />
              <span className="font-semibold text-blue-600 dark:text-blue-300">{c.user?.username || "Unknown"}:</span> {c.content}
            </div>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); onAddComment(post._id, comment, setComment); }} className="flex gap-2 mt-3">
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="flex-1 border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-gray-800 dark:text-white font-sans" />
          <button type="submit" className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-yellow-500 transition text-base font-bold shadow">Comment</button>
        </form>
      </div>
    </div>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="max-w-sm w-full mx-auto p-6 bg-white rounded shadow font-sans dark:bg-gray-900 dark:text-gray-100 dark:border dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4 text-center font-display">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-sans">Login</button>
        </form>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        <p className="mt-4 text-sm text-center">Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a></p>
      </div>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRegister({ username, email, password });
      setSuccess('Registration successful! Please login.');
      setError('');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setSuccess('');
    }
  };
  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="max-w-sm w-full mx-auto p-6 bg-white rounded shadow font-sans dark:bg-gray-900 dark:text-gray-100 dark:border dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4 text-center font-display">Register</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-sans">Register</button>
        </form>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        {success && <p className="text-green-600 mt-2 text-center">{success}</p>}
        <p className="mt-4 text-sm text-center">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></p>
      </div>
    </div>
  );
}

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const username = window.location.pathname.split("/").pop();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [username]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await require("./api").getProfile(username);
      setProfile(res.data);
    } catch (err) {
      setError("Failed to load profile");
    }
    setLoading(false);
  }

  async function handleFollow() {
    try {
      await require("./api").followUser(username);
      fetchProfile();
    } catch (err) {
      setError("Failed to follow user");
    }
  }
  async function handleUnfollow() {
    try {
      await require("./api").unfollowUser(username);
      fetchProfile();
    } catch (err) {
      setError("Failed to unfollow user");
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh] text-center py-8">Loading profile...</div>;
  if (!profile) return <div className="flex justify-center items-center min-h-[60vh] text-center py-8">User not found</div>;
  const isOwn = user.username === profile.username;
  const isFollowing = profile.followers?.includes(user._id);
  return (
    <div className="w-full flex flex-col items-center">
      <div className="max-w-xl w-full mt-8">
        <div className="flex items-center gap-4 mb-4">
          <img src={AVATAR_PLACEHOLDER + encodeURIComponent(profile.username)} alt="avatar" className="w-16 h-16 rounded-full border-2 border-blue-400" />
          <div>
            <h2 className="text-2xl font-bold mb-1">{profile.username}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-1">Email: {profile.email}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">Followers: {profile.followers?.length || 0} | Following: {profile.following?.length || 0}</p>
            {!isOwn && (
              isFollowing ?
                <button onClick={handleUnfollow} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition mb-2">Unfollow</button> :
                <button onClick={handleFollow} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition mb-2">Follow</button>
            )}
          </div>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <h3 className="text-lg font-semibold mt-4 mb-2">Posts</h3>
        {profile.posts?.length === 0 ? <p className="text-gray-500">No posts yet.</p> : null}
        {profile.posts?.map(post => (
          <div key={post._id} className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <img src={AVATAR_PLACEHOLDER + encodeURIComponent(post.author?.username || 'U')} alt="avatar" className="w-7 h-7 rounded-full border border-gray-300" />
              <span className="font-semibold text-blue-700 dark:text-blue-300">{post.author?.username || "Unknown"}</span>
            </div>
            <div className="my-2 text-lg text-gray-900 dark:text-gray-100">{post.content}</div>
            <div className="text-xs text-gray-400">🕒 {new Date(post.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:username" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
