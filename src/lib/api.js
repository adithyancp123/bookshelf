import axios from 'axios';

// Define the base URL for the Express backend API
const API_URL = 'http://localhost:5000/api';

// Create an axios instance with the base URL
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to automatically add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    // Store the token in localStorage
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await apiClient.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

export const getBooks = async (params = {}) => {
  try {
    const response = await apiClient.get('/books', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBookById = async (id) => {
  try {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReviewsByBookId = async (bookId) => {
  try {
    const response = await apiClient.get('/reviews', { params: { bookId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addReview = async (book_id, rating, comment) => {
  try {
    const response = await apiClient.post('/reviews', { book_id, rating, comment });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export the apiClient for any custom requests
export default apiClient;
