import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

interface Feedback {
  id: string;
  message: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: any;
  page: string;
  userAgent: string;
  status: 'new' | 'reviewed' | 'resolved';
  rating?: number | null;
}

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
  const { user, isAuthenticated } = useAuth();

  const ADMIN_EMAIL = 'belhalyt01@proton.me';

  useEffect(() => {
    // Immediate client-side check for non-admins (optimization)
    if (isAuthenticated && user && user.email !== ADMIN_EMAIL) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time feedback updates
    const feedbackRef = collection(db, 'feedback');
    const q = query(feedbackRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedbackData: Feedback[] = [];
      snapshot.forEach((doc) => {
        feedbackData.push({
          id: doc.id,
          ...doc.data()
        } as Feedback);
      });
      setFeedbacks(feedbackData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching feedback:', error);
      if (error.code === 'permission-denied') {
        setAccessDenied(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const updateFeedbackStatus = async (feedbackId: string, newStatus: 'new' | 'reviewed' | 'resolved') => {
    try {
      const feedbackRef = doc(db, 'feedback', feedbackId);
      await updateDoc(feedbackRef, { status: newStatus });
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await deleteDoc(doc(db, 'feedback', feedbackId));
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredFeedbacks = filter === 'all'
    ? feedbacks
    : feedbacks.filter(f => f.status === filter);

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to view user feedback.</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view feedback.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">User Feedback</h1>
          <p className="text-gray-600">Manage and review feedback from your users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-gray-900 mb-1">{feedbacks.length}</div>
            <div className="text-sm text-gray-600">Total Feedback</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {feedbacks.filter(f => f.status === 'new').length}
            </div>
            <div className="text-sm text-gray-600">New</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {feedbacks.filter(f => f.status === 'reviewed').length}
            </div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {feedbacks.filter(f => f.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({feedbacks.length})
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'new'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              New ({feedbacks.filter(f => f.status === 'new').length})
            </button>
            <button
              onClick={() => setFilter('reviewed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'reviewed'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Reviewed ({feedbacks.filter(f => f.status === 'reviewed').length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Resolved ({feedbacks.filter(f => f.status === 'resolved').length})
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No feedback has been submitted yet.'
                : `No ${filter} feedback found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {feedback.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{feedback.userName}</div>
                        <div className="text-sm text-gray-500">{feedback.userEmail}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(feedback.timestamp)}
                      <span className="mx-2">•</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {feedback.page}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(feedback.status)}`}>
                    {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{feedback.message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'new')}
                    disabled={feedback.status === 'new'}
                    className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark as New
                  </button>
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'reviewed')}
                    disabled={feedback.status === 'reviewed'}
                    className="px-3 py-1.5 text-sm font-medium bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'resolved')}
                    disabled={feedback.status === 'resolved'}
                    className="px-3 py-1.5 text-sm font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark as Resolved
                  </button>
                  <div className="flex-1"></div>
                  <button
                    onClick={() => deleteFeedback(feedback.id)}
                    className="px-3 py-1.5 text-sm font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
