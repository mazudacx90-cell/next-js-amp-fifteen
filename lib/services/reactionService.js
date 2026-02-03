// lib/services/reactionService.js
import ApiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../../constants/api.constants';

const apiClient = new ApiClient();

class ReactionService {
  /**
   * Add reaction to a comment
   */
  static async addReaction(articleId, commentId, reactionData) {
    const endpoint = API_ENDPOINTS.REACTIONS.CREATE
      .replace(':articleId', articleId)
      .replace(':commentId', commentId);
    return apiClient.post(endpoint, {
      type: reactionData.type, // like, dislike, love, angry, sad
    });
  }

  /**
   * Remove reaction from a comment
   */
  static async removeReaction(articleId, commentId, reactionId) {
    const endpoint = API_ENDPOINTS.REACTIONS.DELETE
      .replace(':articleId', articleId)
      .replace(':commentId', commentId)
      .replace(':reactionId', reactionId);
    return apiClient.delete(endpoint);
  }

  /**
   * Get available reaction types
   */
  static getReactionTypes() {
    return ['like', 'dislike', 'love', 'angry', 'sad'];
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

export default ReactionService;
