// pages/articles/[canonical]/comments/[commentId].js
import ArticleService from '@/lib/services/articleService';
import i18n from '@/lib/i18n/i18n';
import { LOCAL_API_ROUTES } from '@/constants/api.constants';

export const config = { amp: true };

export async function getStaticProps({ params }) {
  try {
    // Initialize i18n
    await i18n.init('en');

    try {
      // Fetch article for title + canonical context
      const articleResponse = await ArticleService.getArticleDetail(params.canonical);

      if (articleResponse.status === 'success' && articleResponse.data) {
        const article = articleResponse.data;
        const commentId = String(params.commentId);

        // Helper: iterate cursor pagination until we find a specific commentId (top-level comments)
        const fetchMainComment = async () => {
          const seenCommentIds = new Set();
          const seenPageIds = new Set();
          let pageId = null;
          let guard = 0;

          while (guard < 200) {
            guard += 1;
            const resp = await ArticleService.getArticleComments(params.canonical, {
              pageId,
              limit: 100,
              // no parentId => top-level comments
            });

            if (resp?.status !== 'success') return null;

            for (const c of resp.data?.items || []) {
              const id = String(c.id);
              if (seenCommentIds.has(id)) continue;
              seenCommentIds.add(id);
              if (id === commentId) return c;
            }

            if (!resp.data?.hasMore || !resp.data?.nextPageId) return null;
            // Cursor pagination: nextPageId is the cursor value to pass as pageId.
            // It can equal the last seen comment id; that's expected, so don't treat it as a loop.
            const nextPageId = String(resp.data.nextPageId);
            if (seenPageIds.has(nextPageId)) return null;
            seenPageIds.add(nextPageId);
            pageId = resp.data.nextPageId;
          }

          return null;
        };

        // Helper: fetch ALL replies for this commentId using cursor pagination (parentId = commentId)
        const fetchAllReplies = async () => {
          const seenReplyIds = new Set();
          const seenPageIds = new Set();
          const all = [];
          let pageId = null;
          let guard = 0;

          while (guard < 500) {
            guard += 1;
            const resp = await ArticleService.getArticleComments(params.canonical, {
              parentId: commentId,
              pageId,
              limit: 100,
            });

            if (resp?.status !== 'success') break;

            for (const r of resp.data?.items || []) {
              const id = String(r.id);
              if (seenReplyIds.has(id)) continue;
              seenReplyIds.add(id);
              all.push(r);
            }

            if (!resp.data?.hasMore || !resp.data?.nextPageId) break;
            const nextPageId = String(resp.data.nextPageId);
            if (seenPageIds.has(nextPageId)) break;
            seenPageIds.add(nextPageId);
            pageId = resp.data.nextPageId;
          }

          return all;
        };

        const comment = await fetchMainComment();
        if (!comment) return { notFound: true };

        let replies = [];
        if ((comment.replyCount ?? 0) > 0) {
          try {
            replies = await fetchAllReplies();
          } catch (e) {
            console.warn('Failed to fetch replies:', e.message);
          }
        }

        return {
          props: {
            article,
            comment,
            replies,
            translations: i18n.getTranslations()
          },
          revalidate: 10
        };
      }
    } catch (apiError) {
      console.warn(`API unavailable for article ${params.canonical}:`, apiError.message);
      return { revalidate: 5 };
    }

    return { revalidate: 5 };
  } catch (error) {
    console.error(`Error fetching comment ${params.commentId}:`, error);
    return { revalidate: 5 };
  }
}

export async function getStaticPaths() {
  try {
    await i18n.init('en');

    // Fetch all categories
    const categoriesResponse = await ArticleService.getCategories({
      parentId: 0
    });

    if (categoriesResponse.status === 'success' && categoriesResponse.data?.data) {
      const categories = categoriesResponse.data.data;
      const paths = [];

      // For each category, fetch articles and their comments
      for (const category of categories) {
        try {
          const categoryKey = category.canonical || category.name;
          const articlesResponse = await ArticleService.getArticlesByCategory(categoryKey, {
            page: 1,
            limit: 100
          });

          if (articlesResponse.status === 'success' && Array.isArray(articlesResponse.data)) {
            for (const article of articlesResponse.data) {
              // Fetch article detail to get comments
              try {
                const articleDetail = await ArticleService.getArticleDetail(article.canonical);
                if (articleDetail.status === 'success' && articleDetail.data?.comments) {
                  // Create a path for each comment
                  const commentPaths = articleDetail.data.comments.map(comment => ({
                    params: {
                      canonical: article.canonical,
                      commentId: String(comment.id)
                    }
                  }));
                  paths.push(...commentPaths);
                }
              } catch (e) {
                // Continue if article detail fails
              }
            }
          }
        } catch (categoryError) {
          console.warn(`Failed to fetch articles for category:`, categoryError.message);
        }
      }

      return {
        paths,
        fallback: 'blocking'
      };
    }
  } catch (apiError) {
    console.warn('API unavailable during build:', apiError.message);
  }

  return {
    paths: [],
    fallback: 'blocking'
  };
}

export default function CommentDetail({ article = {}, comment = {}, replies = [], translations = {} }) {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateString || 'Date not available';
    }
  };

  return (
    <>
      <div>
        <div className="container">
          <a href={`/articles/${article.canonical}`} className="back-link">← Back to Article</a>

          <div className="article-header">
            <h2 className="article-title">{article.title}</h2>
          </div>

          <div className="article-content">
            {/* Main Comment */}
            <div className="comments-section">
              <h3>Comment</h3>
              <div className="comment">
                <p className="comment-author"><strong>{comment.playerName}</strong></p>
                <p className="comment-date">{formatDate(comment.createdDt)}</p>
                <p className="comment-text">{comment.commentValue}</p>
                <div className="comment-actions">
                  <span className="comment-likes">👍 {comment.commentLike || 0} likes</span>
                  <span className="comment-dislikes">👎 {comment.commentDislike || 0} dislikes</span>
                </div>
              </div>

              {/* Replies Section */}
              {replies && replies.length > 0 ? (
                <div className="replies-section">
                  <h3>Replies ({replies.length})</h3>
                  <div className="replies-list">
                    {replies.map((reply, idx) => (
                      <div key={idx} className="reply">
                        <p className="reply-author"><strong>{reply.author || reply.playerName}</strong></p>
                        <p className="reply-date">{formatDate(reply.date || reply.createdDt)}</p>
                        <p className="reply-text">{reply.text || reply.commentValue}</p>
                        <div className="reply-actions">
                          <span className="reply-likes">👍 {reply.likes || reply.commentLike || 0}</span>
                          <span className="reply-dislikes">👎 {reply.dislikes || reply.commentDislike || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-replies">No replies yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
