import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Blog } from '../types';

const BlogDetails: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(   
          `https://trkpfyqlmd.execute-api.us-east-1.amazonaws.com/prod/blogs`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Blog[] = await response.json();
        const foundBlog = data.find((b) => b.blogId === blogId) || null;
        setBlog(foundBlog);
      } catch (err: any) {
        console.error('Failed to load blog:', err);
        setError('Failed to load blog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-600 text-lg mb-4">Blog not found</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const displayAuthor = (blog.author || 'Unknown author').split('-')[0].trim() || 'Unknown author';

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8 flex flex-col">
        <article className="bg-white rounded-2xl shadow-md p-8 mb-8 transition-transform transform hover:-translate-y-1">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{blog.title}</h1>
          <p className="text-gray-600 mb-6">By {displayAuthor} ~</p>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {blog.content}
          </div>
        </article>

        <button
          onClick={() => navigate('/')}
          className="self-center mt-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default BlogDetails;
