import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getFeed = () => api.get('/posts');
export const createPost = (data) => api.post('/posts', data);
export const likePost = (id) => api.post(`/posts/${id}/like`);
export const getProfile = (username) => api.get(`/users/${username}`);
export const followUser = (username) => api.post(`/users/${username}/follow`);
export const unfollowUser = (username) => api.post(`/users/${username}/unfollow`);
export const addComment = (postId, data) => api.post(`/comments/${postId}`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);

export default api; 