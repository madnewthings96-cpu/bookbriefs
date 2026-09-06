import React from 'react';

interface OrganizationSchemaProps {
  type: 'organization';
}

interface WebsiteSchemaProps {
  type: 'website';
  searchUrl?: string;
}

interface ArticleSchemaProps {
  type: 'article';
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  url: string;
}

interface BookSchemaProps {
  type: 'book';
  name: string;
  author: string;
  isbn?: string;
  image: string;
  description: string;
  genre?: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface BreadcrumbSchemaProps {
  type: 'breadcrumb';
  items: Array<{
    name: string;
    url: string;
  }>;
}

type StructuredDataProps = 
  | OrganizationSchemaProps 
  | WebsiteSchemaProps 
  | ArticleSchemaProps 
  | BookSchemaProps
  | BreadcrumbSchemaProps;

const StructuredData: React.FC<StructuredDataProps> = (props) => {
  const baseUrl = window.location.origin;

  const getSchema = () => {
    switch (props.type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'BookBriefs',
          url: baseUrl,
          logo: `${baseUrl}/favicon/ta7leel.png`,
          description: 'Transform your learning with powerful book summaries. Get key insights from the world\'s greatest minds.',
          sameAs: [
            'https://twitter.com/ta7leel',
            'https://facebook.com/ta7leel',
            'https://linkedin.com/company/ta7leel',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@ta7leel.pro',
          },
        };

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'BookBriefs',
          url: baseUrl,
          description: 'Discover book summaries, key insights, and learning resources from top business and self-help books.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/summaries?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };

      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: props.title,
          description: props.description,
          image: props.image.startsWith('http') ? props.image : `${baseUrl}${props.image}`,
          datePublished: props.datePublished,
          dateModified: props.dateModified || props.datePublished,
          author: {
            '@type': 'Person',
            name: props.authorName,
          },
          publisher: {
            '@type': 'Organization',
            name: 'BookBriefs',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/favicon/ta7leel.png`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': props.url,
          },
        };

      case 'book':
        return {
          '@context': 'https://schema.org',
          '@type': 'Book',
          name: props.name,
          author: {
            '@type': 'Person',
            name: props.author,
          },
          image: props.image.startsWith('http') ? props.image : `${baseUrl}${props.image}`,
          description: props.description,
          ...(props.isbn && { isbn: props.isbn }),
          ...(props.genre && { genre: props.genre }),
          ...(props.aggregateRating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: props.aggregateRating.ratingValue,
              reviewCount: props.aggregateRating.reviewCount,
            },
          }),
        };

      case 'breadcrumb':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: props.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
          })),
        };

      default:
        return null;
    }
  };

  const schema = getSchema();

  if (!schema) return null;

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default StructuredData;
