import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Blog } from '../types';
import { blogsApi } from '../api/blogs';
import BlogCard from '../components/BlogCard';
import BlogForm from '../components/BlogForm';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const storedUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const extractAuthorName = (author?: string) => {
    if (!author) return '';
    return author.split('-')[0].trim();
  };

  const storedEmail = storedUser?.email || user?.email || '';

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const data: Blog[] = await blogsApi.getAll();
        const normalizedData = data.map((b) => ({ ...b, author: extractAuthorName(b.author) }));

        
        const maybeState = location.state as { newBlog?: Blog } | null;
        const incoming = maybeState?.newBlog
          ? {
              ...maybeState.newBlog,
              blogId: maybeState.newBlog.blogId,
              author: extractAuthorName(maybeState.newBlog.author),
            }
          : null;

        if (incoming) {
          const merged = [
            incoming,
            ...normalizedData.filter((b) => b.blogId !== incoming.blogId),
          ];
          setBlogs(merged);
        } else {
          setBlogs(normalizedData);
        }
      } catch (err: any) {
        console.error('Failed to load blogs:', err);
        const message =
          err.response?.data?.message ||
          err.message ||
          'Failed to load blogs. Please try again later.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [location.state]);

  const handleCreateBlog = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowForm(true);
  };

  const handleSubmitNewBlog = async (blog: { title: string; content: string; author: string }) => {
    const authorName = blog.author.trim();

    if (!authorName) {
      throw new Error('Author name is required');
    }

    if (!storedEmail) {
      throw new Error('User email not found. Please re-login.');
    }

    const combinedAuthor = `${authorName}-${storedEmail}`;

    // Close the modal immediately and show a loading state
    setShowForm(false);
    setLoading(true);

    try {
      const newBlog = await blogsApi.create({ ...blog, author: combinedAuthor });
      const id = (newBlog as any)?.blogId || (newBlog as any)?.id || `temp-${Date.now()}`;

      const mergedBlog = {
        ...newBlog,
        blogId: id,
        title: newBlog.title || blog.title,
        content: newBlog.content || blog.content,
        author: extractAuthorName(newBlog.author) || authorName,
      };

      // Prepend new blog to the list so it appears immediately
      setBlogs((prev) => [mergedBlog, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Latest Blogs</h1>
          <button
            onClick={handleCreateBlog}
            className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            + Create New Blog
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl mt-20 p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Create New Blog</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close create blog modal"
                >
                  ✕
                </button>
              </div>
              <BlogForm onSubmit={handleSubmitNewBlog} />
            </div>
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blogs found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.blogId} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;