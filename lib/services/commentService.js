// lib/services/commentService.js
import ApiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../../constants/api.constants';

const apiClient = new ApiClient();

class CommentService {
  /**
   * Get comments for an article
   */
  static async getComments(articleId, params = {}) {
    const { page = 1, limit = 10, sort = 'date', order = 'desc' } = params;
    const queryParams = new URLSearchParams({ page, limit, sort, order });
    const endpoint = `${API_ENDPOINTS.COMMENTS.LIST.replace(':articleId', articleId)}?${queryParams.toString()}`;
    return apiClient.get(endpoint);
  }

  /**
   * Create a new comment
   */
  static async createComment(articleId, commentData) {
    const endpoint = API_ENDPOINTS.COMMENTS.CREATE.replace(':articleId', articleId);
    return apiClient.post(endpoint, {
      text: commentData.text,
      rating: commentData.rating || null,
    });
  }

  /**
   * Get comment detail
   */
  static async getCommentDetail(articleId, commentId) {
    const endpoint = API_ENDPOINTS.COMMENTS.DETAIL
      .replace(':articleId', articleId)
      .replace(':commentId', commentId);
    return apiClient.get(endpoint);
  }

  /**
   * Update comment
   */
  static async updateComment(articleId, commentId, commentData) {
    const endpoint = API_ENDPOINTS.COMMENTS.UPDATE
      .replace(':articleId', articleId)
      .replace(':commentId', commentId);
    return apiClient.patch(endpoint, { text: commentData.text });
  }

  /**
   * Delete comment
   */
  static async deleteComment(articleId, commentId) {
    const endpoint = API_ENDPOINTS.COMMENTS.DELETE
      .replace(':articleId', articleId)
      .replace(':commentId', commentId);
    return apiClient.delete(endpoint);
  }

  /**
   * Set language
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

export default CommentService;
