// pages/api/mockArticles.js
/**
 * Mock API endpoint for articles
 * Replace with actual API calls to backend
 */

export default function handler(req, res) {
  if (req.method === 'GET') {
    const articles = [
      {
        id: 1,
        slug: 'getting-started-with-amp',
        title: 'Getting Started with AMP',
        category: 'Technology',
        excerpt: 'Learn the basics of building fast mobile pages with AMP.',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=400&fit=crop',
        date: '2024-01-15',
        author: 'John Doe',
        views: 1250,
      },
      {
        id: 2,
        slug: 'amp-best-practices',
        title: 'AMP Best Practices for 2025',
        category: 'Technology',
        excerpt: 'Discover the latest best practices for optimizing AMP pages.',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
        date: '2024-01-20',
        author: 'Jane Smith',
        views: 980,
      },
    ];

    res.status(200).json({
      status: 'success',
      data: articles,
      total: articles.length,
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
