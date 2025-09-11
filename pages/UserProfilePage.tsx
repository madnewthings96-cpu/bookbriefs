import React from 'react';
import UserEngagement from '../components/UserEngagement';
import SurpriseMe from '../components/SurpriseMe';

const UserProfilePage: React.FC = () => {
  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-4xl font-bold text-center mb-4" style={{ color: '#2F4F4F' }}>
          My Profile
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Track your reading progress and discover new books
        </p>
      </div>

      {/* User Engagement Section */}
      <UserEngagement />

      {/* Surprise Me Section */}
      <SurpriseMe />
    </div>
  );
};

export default UserProfilePage;
