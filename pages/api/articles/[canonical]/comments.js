// pages/api/articles/[canonical]/comments.js
import ArticleService from '@/lib/services/articleService';
import { API_ENDPOINTS } from '@/constants/api.constants';

/**
 * API endpoint for fetching article comments
 * Used by amp-list component for lazy loading comments
 * Supports pagination with page parameter
 * 
 * Backend endpoint: POST API_ENDPOINTS.COMMENTS.LIST
 * Local route: GET /api/articles/[canonical]/comments
 */
export default async function handler(req, res) {
  const { canonical } = req.query;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  if (!canonical) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing canonical parameter'
    });
  }

  try {
    console.log(`[API] Fetching comments for article: ${canonical}, page: ${page}, limit: ${limit}`);
    
    // Fetch comments from Lucee API using ArticleService
    // ArticleService uses API_ENDPOINTS.COMMENTS.LIST internally
    const commentsResponse = await ArticleService.getArticleComments(canonical, {
      page,
      limit
    });

    console.log(`[API] Comments response:`, JSON.stringify(commentsResponse, null, 2));

    if (commentsResponse.status === 'success') {
      // Return data in AMP-list compatible format
      // amp-list expects the response structure to match the Mustache template
      console.log(`[API] Sending to AMP:`, JSON.stringify(commentsResponse.data, null, 2));
      return res.status(200).json(commentsResponse.data);
    } else {
      return res.status(500).json({
        status: 'error',
        message: commentsResponse.error || 'Failed to fetch comments'
      });
    }
  } catch (error) {
    console.error(`Error fetching comments for ${canonical}:`, error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
