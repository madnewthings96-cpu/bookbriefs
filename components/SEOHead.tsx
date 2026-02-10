import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'article' | 'book' | 'profile';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    canonical?: string;
    noindex?: boolean;
}

const SITE_NAME = 'تحليل - Ta7leel';
const BASE_URL = 'https://ta7leel.site';
const DEFAULT_IMAGE = '/images/og-default.jpg';
const DEFAULT_KEYWORDS = 'book summaries, business books, self-help books, ملخصات كتب, كتب أعمال, تطوير ذاتي';

const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    keywords = DEFAULT_KEYWORDS,
    image = DEFAULT_IMAGE,
    type = 'website',
    author = SITE_NAME,
    publishedTime,
    modifiedTime,
    canonical,
    noindex = false,
}) => {
    const location = useLocation();
    const currentUrl = canonical || `${BASE_URL}${location.pathname}`;
    const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

    return (
        <Helmet>
            {/* Primary */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content={author} />
            <meta
                name="robots"
                content={
                    noindex
                        ? 'noindex, nofollow'
                        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
                }
            />

            {/* Canonical */}
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="ar_AE" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImageUrl} />
            <meta name="twitter:site" content="@ta7leel" />

            {/* Article-specific */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}
        </Helmet>
    );
};

export default SEOHead;
