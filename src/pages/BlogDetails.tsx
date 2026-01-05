import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Blog } from '../types';
import { useAuth } from '../context/AuthContext';
import { Comment } from '../types';



const BlogDetails: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);

  // Load blog comments from localStorage
  useEffect(() => {
    if (blogId) {
      const storedComments = localStorage.getItem(`comments_${blogId}`);
      if (storedComments) setComments(JSON.parse(storedComments));
    }
  }, [blogId]);

  useEffect(() => {
    let retryCount = 3;

    const fetchBlog = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          'https://trkpfyqlmd.execute-api.us-east-1.amazonaws.com/prod/blogs'
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Blog[] = await response.json();
        const foundBlog = data.find((b) => b.blogId === blogId) || null;

        if (!foundBlog && retryCount > 0) {
          retryCount--;
          setTimeout(fetchBlog, 1000);
          return;
        }

        setBlog(foundBlog);
      } catch (err) {
        setError('Failed to load blog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (blogId) fetchBlog();
  }, [blogId]);

  const saveComment = () => {
    if (!commentText.trim() || !user) return;

    const newComment: Comment = {
      id: `${Date.now()}`,
      blogId: blogId!,
      author: user?.username || 'Anonymous',
      content: commentText,
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    localStorage.setItem(`comments_${blogId}`, JSON.stringify(updatedComments));
    setCommentText('');
    setIsModalOpen(false);
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, 2);

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

  const displayAuthor =
    (blog.author || 'Unknown author').split('-')[0].trim() || 'Unknown author';

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50 flex flex-col items-center relative">
      <button
        onClick={() => navigate('/')}
        className="fixed top-24 left-20 z-50 w-12 h-12 flex items-center justify-center
               bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg
               transition-all duration-300 hover:scale-105"
        aria-label="Back to Home"
      >
        ←
      </button>

      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8 flex flex-col">
        <article className="bg-white rounded-2xl shadow-md p-8 mb-8 transition-transform transform hover:-translate-y-1 relative">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{blog.title}</h1>
          <p className="text-gray-600 mb-6">By {displayAuthor} ~</p>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {blog.content}
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute bottom-4 right-4 
             bg-white 
             text-blue-600 hover:text-blue-700 
             px-4 py-2 
             text-sm 
             rounded-full 
             border border-black/20 
             shadow-sm hover:shadow-md 
             transition-all duration-300"
            >
              Add Comment
            </button>

          )}
        </article>

        {/* Display comments */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 w-full">
          <h2 className="text-2xl font-semibold mb-4">
            Comments ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet. Be the first!</p>
          ) : (
            <>
              {visibleComments.map((c) => (
                <div key={c.id} className="mb-4 border-b pb-2">
                  <p className="font-semibold text-gray-800">{c.author}</p>
                  <p className="text-gray-700">{c.content}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(c.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}

              {comments.length > 2 && (
                <button
                  onClick={() => setShowAllComments((prev) => !prev)}
                  className="mt-4 mx-auto block px-4 py-2 text-blue-600 font-medium rounded-lg cursor-pointer transition-all duration-300 hover:bg-blue-50  hover:text-blue-700 hover:shadow-md ">
                  {showAllComments ? 'Show less' : 'Show more'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-semibold mb-4">Add a Comment</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveComment}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetails;
