// Single shared AMP custom CSS string - used only in _document.js to avoid duplicate <style amp-custom>
// AMP allows exactly one <style amp-custom> in <head>. Do not add amp-custom in pages.
export const ampCustomCss = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; color: #222; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif; line-height: 1.6; font-size: 15px; }
.container { max-width: 1200px; margin: 0 auto; padding: 16px 20px; }
.hero { margin-bottom: 40px; border-top: 4px solid #222; padding-top: 20px; }
.hero h1 { margin: 0 0 8px; font-size: 36px; font-weight: 700; color: #222; line-height: 1.2; }
.hero p { margin: 0 0 24px; font-size: 16px; color: #666; max-width: 600px; }
.hero-img { width: 100%; height: 280px; object-fit: cover; display: block; margin-bottom: 24px; }
.category-tabs { display: flex; gap: 24px; margin: 32px 0; padding-bottom: 16px; border-bottom: 1px solid #e5e5e5; overflow-x: auto; flex-wrap: nowrap; }
.tab-button { position: relative; padding: 8px 0; border: none; background: none; cursor: pointer; font-size: 15px; font-weight: 500; color: #666; text-decoration: none; white-space: nowrap; }
.tab-button[selected] { color: #222; font-weight: 600; outline: none; }
.tab-button[selected]::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: #222; }
.category-heading { font-size: 24px; font-weight: 700; color: #222; margin: 40px 0 24px; padding-bottom: 12px; border-bottom: 2px solid #e5e5e5; }
.articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 40px; }
.article-card { text-decoration: none; color: inherit; display: block; border: 1px solid #f0f0f0; overflow: hidden; }
.article-image { width: 100%; height: 140px; object-fit: cover; display: block; }
.article-image-placeholder { width: 100%; height: 140px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 14px; }
.article-content { padding: 12px; }
.article-category { display: inline-block; font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.article-title { margin: 0 0 6px; font-size: 15px; font-weight: 600; color: #222; line-height: 1.3; }
.article-excerpt { margin: 0 0 8px; font-size: 13px; color: #666; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.article-meta { display: flex; gap: 12px; font-size: 12px; color: #999; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f0f0f0; }

/* ===== ARTICLE PAGE (BBC/CNN-ish) ===== */
.article-page { padding-bottom: 40px; }
.article-shell { max-width: 760px; margin: 0 auto; }
.article-header { margin: 16px 0 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e5e5; }
.article-kicker { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #b00020; margin-bottom: 10px; }
.article-headline { margin: 0 0 10px; font-size: 40px; line-height: 1.12; font-weight: 800; color: #111; }
.article-subhead { margin: 0 0 14px; font-size: 18px; line-height: 1.45; color: #444; }
.article-byline-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: baseline; font-size: 13px; color: #666; }
.article-byline { font-weight: 600; color: #333; }
.article-date { color: #666; }

.article-figure { margin: 18px 0 18px; }
.article-hero-image { width: 100%; height: auto; max-height: 460px; object-fit: cover; display: block; }
.article-caption { margin-top: 8px; font-size: 12px; color: #777; line-height: 1.4; }

.article-body { margin: 18px 0 24px; line-height: 1.85; font-size: 17px; color: #222; }
.article-body p { margin: 0 0 16px; }
.article-body p:first-child { font-size: 18px; color: #1f1f1f; }
.article-body a { color: #0b57d0; text-decoration: underline; }
.article-empty { color: #777; font-style: italic; }

.article-taxonomy { margin: 18px 0; }
.article-taxonomy-block { padding: 12px 0; border-top: 1px solid #eee; }
.article-taxonomy-label { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #666; margin-bottom: 8px; }
.article-taxonomy-list { margin: 0; padding-left: 18px; }
.article-taxonomy-item { margin: 4px 0; font-size: 14px; color: #555; }
.article-keywords { margin: 18px 0; padding-top: 12px; border-top: 1px solid #eee; }
.article-keywords-text { display: block; margin-top: 6px; font-size: 14px; color: #555; }

/* ===== COMMENTS ===== */
.article-comments-section { margin-top: 34px; padding-top: 22px; border-top: 2px solid #e5e5e5; }
.comments-title { margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #111; }
.comments-empty { color: #777; font-style: italic; margin: 0; }
.comments-list { display: flex; flex-direction: column; gap: 14px; }
.comment { padding: 16px; background: #f8f8f8; border: 1px solid #eee; border-left: 4px solid #111; }
.comment-top { display: flex; flex-wrap: wrap; gap: 10px; align-items: baseline; margin-bottom: 10px; }
.comment-author { font-weight: 700; color: #222; font-size: 14px; }
.comment-date { font-size: 12px; color: #777; }
.comment-text { font-size: 14px; color: #333; line-height: 1.6; }
.comment-actions { display: flex; gap: 16px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e7e7e7; font-size: 12px; color: #666; }
.replies-container { margin-top: 10px; }
.replies-link { display: inline-block; font-size: 13px; font-weight: 600; color: #0b57d0; text-decoration: underline; }

@media (max-width: 768px) { .container { padding: 12px 16px; } .hero h1 { font-size: 28px; } .hero-img { height: 200px; } .articles-grid { grid-template-columns: 1fr; } .category-tabs { gap: 16px; margin: 24px 0; } .category-heading { font-size: 18px; } }
@media (max-width: 768px) { .article-shell { max-width: 100%; } .article-headline { font-size: 30px; } .article-subhead { font-size: 16px; } .article-body { font-size: 16px; } }
@media (max-width: 480px) { .container { padding: 12px; } .hero h1 { font-size: 22px; } .category-tabs { gap: 12px; } .article-headline { font-size: 26px; } }
`;
