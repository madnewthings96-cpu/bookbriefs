
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6" style={{ color: '#2F4F4F' }}>
        About BookBriefs
      </h1>
      <div className="prose max-w-none text-gray-800 leading-relaxed space-y-6">
        <p>
          In a world overflowing with information, finding the time to read and absorb the knowledge from groundbreaking books can be a challenge. That's where <strong>BookBriefs</strong> comes in. Our mission is to unlock the big ideas from the world's best non-fiction books, making them accessible to everyone, everywhere.
        </p>
        <p>
          We believe in the power of ideas to change lives, and we're passionate about learning and personal growth. However, we also understand the constraints of a busy schedule. BookBriefs was created for the curious minds who want to learn faster and more efficiently.
        </p>
        <h2 className="text-2xl font-bold mt-8" style={{ color: '#2F4F4F' }}>How It Works</h2>
        <p>
          Using the power of advanced Artificial Intelligence, specifically Google's Gemini models, we distill lengthy books into concise, easy-to-digest summaries and key takeaways. We focus on capturing the core essence of each book, so you can grasp the main concepts in minutes, not hours.
        </p>
        <h2 className="text-2xl font-bold mt-8" style={{ color: '#2F4F4F' }}>Our Vision</h2>
        <p>
          Our vision is to build a vibrant community of lifelong learners. We aim to be your trusted companion on your journey of knowledge and self-improvement. Whether you're a student, a professional, an entrepreneur, or simply someone with a thirst for knowledge, BookBriefs is here to help you unlock big ideas, faster.
        </p>
        <p>
          Thank you for joining us on this journey. Happy learning!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;