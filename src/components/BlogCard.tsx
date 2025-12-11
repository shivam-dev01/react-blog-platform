import React from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../types';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const id = blog.blogId || (blog as any)?.id || (blog as any)?.blogID || '';
  const title = blog.title || 'Untitled';
  const author = blog.author || 'Unknown author';
  const content = blog.content || '';
  const preview = content.length > 150 ? content.substring(0, 150) + '...' : content;

  const displayAuthor = author.split('-')[0].trim() || 'Unknown author';

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex flex-col flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors duration-300">
          {id ? (
            <Link to={`/blogs/${blog.blogId}`}>{title}</Link>
          ) : (
            <span>{title}</span>
          )}
        </h2>

        <p className="text-gray-600 mb-6 line-clamp-3">{preview || 'No content provided.'}</p>

        <div className="mt-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">By {displayAuthor} ~</p>
          {id ? (
            <Link
            to={`/blogs/${blog.blogId}`}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
            >
              Read more →
            </Link>
          ) : (
            <span className="text-gray-400 text-sm">Missing blog id</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
