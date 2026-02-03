// lib/services/replyService.js
import ApiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../../constants/api.constants';

const apiClient = new ApiClient();

class ReplyService {
  /**
   * Get replies for a comment
   */
  static async getReplies(articleId, commentId, params = {}) {
    const { page = 1, limit = 5, sort = 'date', order = 'asc' } = params;
    const queryParams = new URLSearchParams({ page, limit, sort, order });
    const endpoint = `${API_ENDPOINTS.REPLIES.LIST
      .replace(':articleId', articleId)
      .replace(':commentId', commentId)}?${queryParams.toString()}`;
    return apiClient.get(endpoint);
  }

  /**
   * Create a reply to a comment
   */
  static async createReply(articleId, commentId, replyData) {
    const endpoint = API_ENDPOINTS.REPLIES.CREATE
      .replace(':articleId', articleId)
      .replace(':commentId', commentId);
    return apiClient.post(endpoint, {
      text: replyData.text,
      mentionedUser: replyData.mentionedUser || null,
    });
  }

  /**
   * Delete reply
   */
  static async deleteReply(articleId, commentId, replyId) {
    const endpoint = API_ENDPOINTS.REPLIES.DELETE
      .replace(':articleId', articleId)
      .replace(':commentId', commentId)
      .replace(':replyId', replyId);
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

export default ReplyService;
