import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogsApi } from '../api/blogs';
import BlogForm from '../components/BlogForm';
import { useAuth } from '../context/AuthContext';

const AddBlog: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const storedUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const storedEmail = storedUser?.email || user?.email || '';

  const handleSubmit = async (blog: { title: string; content: string; author: string }) => {
    const authorName = blog.author.trim();

    if (!authorName) {
      throw new Error('Author name is required');
    }

    if (!storedEmail) {
      throw new Error('User email not found. Please re-login.');
    }

    const combinedAuthor = `${authorName}-${storedEmail}`;

    const newBlog = await blogsApi.create({ ...blog, author: combinedAuthor });
    const id = newBlog.blogId || (newBlog as any)?.id || `temp-${Date.now()}`;
    const displayAuthor = (newBlog.author || authorName).split('-')[0].trim();

    // Redirect home and optimistically show the new blog
    navigate('/', {
      state: {
        newBlog: {
          ...newBlog,
          blogId: id,
          title: newBlog.title || blog.title,
          content: newBlog.content || blog.content,
          author: displayAuthor,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Create New Blog</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <BlogForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default AddBlog;

