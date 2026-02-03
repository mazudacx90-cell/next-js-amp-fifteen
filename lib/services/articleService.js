// lib/services/articleService.js
import ApiClient from '../api/apiClient';
import apiConfig from '../../config/api.config';
import { API_ENDPOINTS } from '../../constants/api.constants';

const apiClient = new ApiClient();

class ArticleService {
  /**
   * Normalize article data for LIST display
   * Returns minimal fields needed for article list/cards
   */
  static normalizeArticle(apiArticle) {
    if (!apiArticle) return null;
    return {
      canonical: apiArticle.canonical || '',
      title: apiArticle.title || '',
      category: apiArticle.upperdeck || 'Uncategorized',
      excerpt: apiArticle.articleLead || apiArticle.teaser || '',
      image: apiArticle.imagePath ? `${this.getBaseUrl()}${apiArticle.imagePath}` : '',
      date: apiArticle.publishDt || '',
      author: apiArticle.author || 'Unknown'
    };
  }

  /**
   * Normalize article data for DETAIL display
   * Returns full rich content with documents, categories, tags, comments, etc.
   * API returns nested structure with body content, documents array, etc.
   */
  static normalizeArticleDetail(apiArticle) {
    if (!apiArticle) return null;
    
    // Extract featured image from documents array (where isDefault: 1)
    let featuredImage = '';
    if (apiArticle.documents && Array.isArray(apiArticle.documents)) {
      const defaultDoc = apiArticle.documents.find(doc => doc.isDefault === 1);
      if (defaultDoc && defaultDoc.canonical) {
        featuredImage = `${this.getBaseUrl()}/article/${apiArticle.canonical}/document/${defaultDoc.canonical}`;
      }
    }
    
    // Extract main body content from body array (usually first item)
    let bodyContent = '';
    if (apiArticle.body && Array.isArray(apiArticle.body) && apiArticle.body.length > 0) {
      bodyContent = apiArticle.body[0].body || '';
    }
    
    // Use imagePath as fallback if no featured image from documents
    const image = featuredImage || (apiArticle.imagePath ? `${this.getBaseUrl()}${apiArticle.imagePath}` : '');
    
    return {
      canonical: apiArticle.canonical || '',
      title: apiArticle.title || '',
      category: apiArticle.upperdeck || 'Uncategorized',
      excerpt: apiArticle.articleLead || apiArticle.teaser || '',
      image: image,
      date: apiArticle.publishDt || '',
      author: apiArticle.author || 'Unknown',
      // Metadata fields
      metaTitle: apiArticle.metaTitle || apiArticle.title || '',
      metaDesc: apiArticle.metaDesc || apiArticle.articleLead || '',
      metaKeyword: apiArticle.metaKeyword || '',
      // Detail-specific fields
      allowComment: apiArticle.allowComment || 0,
      displayEmoticon: apiArticle.displayEmoticon || 0,
      langId: apiArticle.langId || 'en',
      // Rich content
      content: bodyContent || apiArticle.articleLead || '',
      // Related data
      documents: apiArticle.documents || [],
      categories: apiArticle.categories || [],
      tags: apiArticle.tags || [],
      body: apiArticle.body || [],
      comments: apiArticle.comments || []
    };
  }

  /**
   * Normalize array of articles
   */
  static normalizeArticles(articles) {
    if (!Array.isArray(articles)) return [];
    return articles.map(article => this.normalizeArticle(article));
  }

  /**
   * Get base URL for debugging
   */
  static getBaseUrl() {
    return apiConfig.baseURL;
  }

  /**
   * Get all article categories
   */
  static async getCategories(options = {}) {
    const endpoint = API_ENDPOINTS.ARTICLES.CATEGORIES;
    const fullUrl = `${this.getBaseUrl()}${endpoint}`;
    //console.log(`[ArticleService] Fetching categories from: ${fullUrl}`);
    //console.log(`[ArticleService] Categories request options:`, JSON.stringify(options, null, 2));
    
    // Send as form-urlencoded
    const response = await apiClient.post(endpoint, options, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    //console.log(`[ArticleService] Categories response:`, response.status);
    return response;
  }

  /**
   * Get articles by category
   */
  static async getArticlesByCategory(category, params = {}) {
    const { page = 1, limit = 10, language = "en" } = params;
    const queryParams = new URLSearchParams({ page, limit, language });
    const endpoint = `${API_ENDPOINTS.ARTICLES.BY_CATEGORY.replace(':categoryKey', category)}?${queryParams.toString()}`;
    const fullUrl = `${this.getBaseUrl()}${endpoint}`;
    //console.log(`[ArticleService] Fetching articles by category from: ${fullUrl}`);
    const response = await apiClient.get(endpoint);
    
    // Normalize articles if response is successful
    // API returns nested data structure: { data: { data: [...articles] } }
    if (response.status === 'success' && response.data && response.data.data && Array.isArray(response.data.data)) {
      //console.log(`[ArticleService] Before normalization: ${response.data.data.length} articles`);
      response.data = this.normalizeArticles(response.data.data);
      //console.log(`[ArticleService] After normalization: ${response.data.length} articles`);
    } else if (response.status === 'success' && Array.isArray(response.data)) {
      // Fallback: if data is already an array
      response.data = this.normalizeArticles(response.data);
    }
    return response;
  }

  /**
   * Get article detail by canonical (article's unique identifier)
   * API uses canonical exclusively - no article ID is used
   */
  static async getArticleDetail(canonical) {
    const endpoint = API_ENDPOINTS.ARTICLES.DETAIL.replace(':articleKey', canonical);
    const fullUrl = `${this.getBaseUrl()}${endpoint}`;
    //console.log(`[ArticleService] Fetching article detail from: ${fullUrl}`);
    const response = await apiClient.get(endpoint);
    
    // Normalize article with detail-specific structure
    if (response.status === 'success' && response.data.data) {
      response.data = this.normalizeArticleDetail(response.data.data);
    }
    return response;
  }

  /**
   * Get article comments with pagination support
   * Returns comments in AMP-compatible format
   */
  static async getArticleComments(canonical, options = {}) {
    // Backend uses cursor pagination via pageId/nextPageId (often returns 1 item per call),
    // but some callers still pass page/limit. Support both.
    const page = options.page || 1;
    const limit = options.limit || 10;
    const parentId = options.parentId ?? options.commentId ?? null;
    const pageId = options.pageId ?? null;
    const endpoint = API_ENDPOINTS.COMMENTS.LIST.replace(':articleKey', canonical);
    
    // Build query string (ApiClient.get does not automatically append query params)
    const queryParams = new URLSearchParams({
      limit: String(limit),
      language: 'en',
      ...(parentId !== null && parentId !== undefined ? { parentId: String(parentId) } : {}),
      ...(pageId !== null && pageId !== undefined ? { pageId: String(pageId) } : { page: String(page) }),
    });
    const endpointWithQuery = `${endpoint}?${queryParams.toString()}`;
    const fullUrl = `${this.getBaseUrl()}${endpointWithQuery}`;
    
    //console.log(`[ArticleService] Fetching comments from: ${fullUrl}`);
    const response = await apiClient.get(endpointWithQuery);
    
    //console.log(`[ArticleService] Comments response status:`, response.status);
    //console.log(`[ArticleService] Comments response data:`, JSON.stringify(response.data, null, 2));
    
    // Transform API response to AMP-compatible format
    if (response.status === 'success' && response.data) {
      // Lucee API responses vary; normalize the common shapes:
      // - { data: { data: [...] , hasMore, nextPageId, total, amount } , errorCode }
      // - { data: [...] , hasMore, nextPageId, total }
      // - { items: [...] , hasMore, nextPageId, total }
      const raw = response.data;
      const container = raw?.data ?? raw; // prefer nested `data` when present
      const commentsData =
        (Array.isArray(container?.data) && container.data) ||
        (Array.isArray(container?.items) && container.items) ||
        (Array.isArray(container) && container) ||
        [];

      const hasMore = Boolean(container?.hasMore ?? raw?.hasMore ?? false);
      const nextPageId = container?.nextPageId ?? raw?.nextPageId ?? null;
      const currentPageId = container?.pageId ?? raw?.pageId ?? null;
      const total = Number(container?.total ?? raw?.total ?? 0);
      const amount = Number(container?.amount ?? raw?.amount ?? 0);

      // Normalize comments
      const normalizedComments = commentsData.map(comment => ({
        id: comment.id || '',
        parentId: comment.parentId ?? null,
        replyCount: comment.replyCount ?? 0,
        // keep both "display" and "raw" keys for pages that still reference old names
        author: comment.playerName || 'Anonymous',
        playerName: comment.playerName || 'Anonymous',
        text: comment.commentValue || '',
        commentValue: comment.commentValue || '',
        date: comment.createdDt || '',
        createdDt: comment.createdDt || '',
        likes: comment.commentLike || 0,
        dislikes: comment.commentDislike || 0,
        commentLike: comment.commentLike || 0,
        commentDislike: comment.commentDislike || 0,
        isOwn: comment.isOwnComment || false,
        isOwnComment: comment.isOwnComment || false,
        modified: comment.modifiedDt || null
      }));
      
      const result = {
        status: 'success',
        data: {
          items: normalizedComments,
          hasMore: hasMore,
          nextPageId: nextPageId,
          pageId: currentPageId,
          total: total,
          amount: amount,
          currentPage: page,
          pageSize: limit
        }
      };
      
      //console.log(`[ArticleService] Normalized comments result:`, JSON.stringify(result, null, 2));
      return result;
    }
    
    //console.log(`[ArticleService] Failed to fetch comments:`, response);
    return response;
  }

  /**
   * Set language for articles
   */
  static setLanguage(lang) {
    apiClient.setLanguage(lang);
  }

  /**
   * Set session token
   */
  static setSessionToken(token) {
    apiClient.setSessionToken(token);
  }
}

export default ArticleService;
