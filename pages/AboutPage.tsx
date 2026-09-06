import React from 'react';
import AboutManifesto from '../components/about/AboutManifesto';
import useSEO from '../hooks/useSEO';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  useSEO({
    title: 'About Ta7leel - Clear Book Summaries for Better Decisions | BookBriefs',
    description: 'Learn why Ta7leel exists, how BookBriefs distills serious books into useful ideas, and how the platform helps readers learn, remember, and apply more.',
    keywords: 'about ta7leel, about bookbriefs, book summaries, learning platform, trading psychology, finance books, self development',
    type: 'website',
  });

  return <AboutManifesto />;
};

export default AboutPage;
