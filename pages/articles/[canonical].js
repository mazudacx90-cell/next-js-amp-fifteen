// pages/articles/[canonical].js
import ArticleService from '@/lib/services/articleService';
import i18n from '@/lib/i18n/i18n';
import { LOCAL_API_ROUTES } from '@/constants/api.constants';

export const config = { amp: true };

export async function getStaticProps({ params }) {
  try {
    // Initialize i18n
    await i18n.init('en');

    // Try to fetch article detail from API
    // Note: params.canonical contains the article canonical value from the route
    try {
      const articleResponse = await ArticleService.getArticleDetail(params.canonical);

      if (articleResponse.status === 'success' && articleResponse.data) {
        const article = articleResponse.data;

        return {
          props: {
            article,
            translations: i18n.getTranslations()
          },
          revalidate: 10 // ISR: revalidate every 10 seconds for fresh data
        };
      }
    } catch (apiError) {
      console.warn(`API unavailable for article ${params.canonical}:`, apiError.message);
      // Return with very short revalidate to retry soon
      return {
        revalidate: 5 // Retry in 5 seconds
      };
    }

    // If API fails, use short revalidate to retry soon instead of permanent notFound
    return { 
      revalidate: 5 // Retry in 5 seconds
    };
  } catch (error) {
    console.error(`Error fetching article ${params.canonical}:`, error);
    return { 
      revalidate: 5 // Retry in 5 seconds
    };
  }
}

export async function getStaticPaths() {
  try {
    // Fetch all categories first
    try {
      const categoriesResponse = await ArticleService.getCategories({
        parentId: 0
      });

      if (categoriesResponse.status === 'success' && categoriesResponse.data && categoriesResponse.data.data) {
        const categories = categoriesResponse.data.data;
        const paths = [];

        // Fetch articles for each category and collect all canonical values
        for (const category of categories) {
          try {
            const categoryKey = category.canonical || category.name;
            const articlesResponse = await ArticleService.getArticlesByCategory(categoryKey, {
              page: 1,
              limit: 100
            });

            if (articlesResponse.status === 'success' && Array.isArray(articlesResponse.data)) {
              const categoryPaths = articlesResponse.data.map((article) => ({
                params: { canonical: article.canonical },
              }));
              paths.push(...categoryPaths);
            }
          } catch (categoryError) {
            console.warn(`Failed to fetch articles for category:`, categoryError.message);
            // Continue with next category
          }
        }

        return {
          paths,
          fallback: 'blocking' // ISR: generate missing paths on demand
        };
      }
    } catch (apiError) {
      console.warn('API unavailable during build, using fallback paths:', apiError.message);
      // API not available, use fallback mode
    }

    // If API fails, return empty paths and use fallback: blocking
    return {
      paths: [],
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error fetching article paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

export default function ArticleDetail({ article = {}, translations = {} }) {
  // Safe date formatting with fallback
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available';
      return new Date(dateString).toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    } catch (e) {
      return dateString || 'Date not available';
    }
  };

  // AMP-safe content rendering: convert HTML-ish strings to plain paragraphs
  // This avoids injecting arbitrary HTML that can break AMP validation.
  const decodeEntities = (str) =>
    String(str)
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>');

  const contentToParagraphs = (content) => {
    if (!content) return [];
    if (typeof content !== 'string') return [String(content)];

    // Convert common block tags to line breaks, then strip all tags.
    const withBreaks = content
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/div>/gi, '\n\n');

    const stripped = decodeEntities(withBreaks.replace(/<[^>]*>/g, ' '))
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    return stripped
      .split(/\n{2,}/g)
      .map((p) => p.trim())
      .filter(Boolean);
  };

  const bodyParagraphs = contentToParagraphs(article.content);

  return (
    <>
      <div className="container article-page">
        <a href="/" className="back-link">← Back to Articles</a>

        <article className="article-shell">
          <header className="article-header">
            <div className="article-kicker">{article.category || 'Uncategorized'}</div>
            <h1 className="article-headline">{article.title || 'Untitled Article'}</h1>
            {article.excerpt && <p className="article-subhead">{article.excerpt}</p>}

            <div className="article-byline-row">
              <span className="article-byline">By {article.author || 'Unknown Author'}</span>
              <span className="article-date">{formatDate(article.date)}</span>
            </div>
          </header>

          {article.image && (
            <figure className="article-figure">
              <amp-img
                src={article.image}
                alt={article.title || 'Article Image'}
                width="1200"
                height="675"
                layout="responsive"
                className="article-hero-image"
              />
              {article.imageCaption && (
                <figcaption className="article-caption">{article.imageCaption}</figcaption>
              )}
            </figure>
          )}

          <div className="article-body">
            {bodyParagraphs.length > 0 ? (
              bodyParagraphs.map((p, idx) => <p key={idx}>{p}</p>)
            ) : (
              <p className="article-empty">Content not available.</p>
            )}
          </div>

          {(Array.isArray(article.categories) && article.categories.length > 0) && (
            <div className="article-taxonomy">
              <div className="article-taxonomy-block">
                <span className="article-taxonomy-label">Categories</span>
                <ul className="article-taxonomy-list">
                  {article.categories.map((cat, idx) => (
                    <li key={idx} className="article-taxonomy-item">{cat.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {(Array.isArray(article.tags) && article.tags.length > 0) && (
            <div className="article-taxonomy">
              <div className="article-taxonomy-block">
                <span className="article-taxonomy-label">Tags</span>
                <ul className="article-taxonomy-list">
                  {article.tags.map((tag, idx) => (
                    <li key={idx} className="article-taxonomy-item">{tag.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {article.metaKeyword && (
            <div className="article-keywords">
              <span className="article-taxonomy-label">Keywords</span>
              <span className="article-keywords-text">{String(article.metaKeyword)}</span>
            </div>
          )}

          {article.allowComment === 1 && (
            <section className="article-comments-section">
              <h2 className="comments-title">Comments</h2>

              {Array.isArray(article.comments) && article.comments.length > 0 ? (
                <div className="comments-list">
                  {article.comments.map((comment, idx) => (
                    <div key={idx} className="comment">
                      <div className="comment-top">
                        <div className="comment-author">{comment.playerName || 'Anonymous'}</div>
                        <div className="comment-date">{comment.createdDt || ''}</div>
                      </div>
                      <div className="comment-text">{comment.commentValue}</div>

                      <div className="comment-actions">
                        <span className="comment-likes">{comment.commentLike || 0} likes</span>
                        <span className="comment-dislikes">{comment.commentDislike || 0} dislikes</span>
                      </div>

                      {comment.replyCount > 0 && (
                        <div className="replies-container">
                          <a href={`${article.canonical}/comments/${comment.id}`} className="replies-link">
                            {comment.replyCount} {comment.replyCount === 1 ? 'Reply' : 'Replies'}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="comments-empty">No comments yet.</p>
              )}
            </section>
          )}
        </article>
      </div>
    </>
  );
}
