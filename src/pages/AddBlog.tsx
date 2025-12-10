import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { blogsApi } from "../api/blogs";
import BlogForm from "../components/BlogForm";

const AddBlog: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (blog: { title: string; content: string }) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const blogData = {
      ...blog,
      author: user.name, 
    };

    try {
      const newBlog = await blogsApi.create(blogData);
      navigate(`/blogs/${newBlog.blogId}`);
    } catch (error) {
      console.error("Error creating blog:", error);
    }
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
