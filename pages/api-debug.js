// pages/api-debug.js
// This page helps you visualize API responses in the browser instead of relying on terminal logs

import ArticleService from '@/lib/services/articleService';
import React from 'react';

export async function getStaticProps() {
  const debugData = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl: ArticleService.getBaseUrl(),
    responses: {}
  };

  // Fetch Categories
  try {
    console.log("\n📂 [API-DEBUG] Fetching categories...");
    const categoriesResponse = await ArticleService.getCategories({ parentId: 0 });
    debugData.responses.categories = {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: categoriesResponse,
      rawStatus: categoriesResponse.status,
      dataLength: Array.isArray(categoriesResponse.data) ? categoriesResponse.data.length : 'N/A'
    };
    console.log("✅ [API-DEBUG] Categories response:", categoriesResponse);
  } catch (error) {
    debugData.responses.categories = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    console.error("❌ [API-DEBUG] Categories error:", error);
  }

  // Fetch articles by different categories if we have them
  if (debugData.responses.categories?.data?.data && Array.isArray(debugData.responses.categories.data.data)) {
    const categories = debugData.responses.categories.data.data;
    debugData.responses.articlesByCategory = {};

    for (const category of categories.slice(0, 3)) { // Only first 3 to avoid too many requests
      try {
        console.log(`\n📄 [API-DEBUG] Fetching articles for category: "${category}"...`);
        const articleResponse = await ArticleService.getArticlesByCategory(category, { page: 1, limit: 5 });
        debugData.responses.articlesByCategory[category] = {
          status: 'success',
          timestamp: new Date().toISOString(),
          data: articleResponse,
          rawStatus: articleResponse.status,
          count: Array.isArray(articleResponse.data) ? articleResponse.data.length : 'N/A'
        };
        console.log(`✅ [API-DEBUG] Articles for "${category}":`, articleResponse);
      } catch (error) {
        debugData.responses.articlesByCategory[category] = {
          status: 'error',
          timestamp: new Date().toISOString(),
          error: error.message
        };
        console.error(`❌ [API-DEBUG] Articles error for "${category}":`, error);
      }
    }
  }

  return {
    props: { debugData },
    revalidate: 60
  };
}

export default function ApiDebugPage({ debugData }) {
  const [expandedSections, setExpandedSections] = React.useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🔍 API Debug Dashboard</h1>
        <p style={styles.subtitle}>
          This page shows real API responses. Check the browser DevTools → Network tab to see actual HTTP requests/responses.
        </p>
      </div>

      {/* Build Info */}
      <div style={styles.section}>
        <div style={styles.sectionHeader} onClick={() => toggleSection('info')}>
          <h2>📋 Build Info</h2>
          <span style={styles.toggle}>{expandedSections.info ? '▼' : '▶'}</span>
        </div>
        {expandedSections.info && (
          <div style={styles.content}>
            <p><strong>Timestamp:</strong> {debugData.timestamp}</p>
            <p><strong>Environment:</strong> {debugData.environment}</p>
            <p><strong>API Base URL:</strong> <code style={styles.code}>{debugData.baseUrl}</code></p>
          </div>
        )}
      </div>

      {/* Categories Response */}
      <div style={styles.section}>
        <div style={styles.sectionHeader} onClick={() => toggleSection('categories')}>
          <h2>
            📂 Categories Response
            {debugData.responses.categories?.status === 'success' ? (
              <span style={styles.successBadge}>✓ {debugData.responses.categories?.dataLength || 0} items</span>
            ) : (
              <span style={styles.errorBadge}>✗ Error</span>
            )}
          </h2>
          <span style={styles.toggle}>{expandedSections.categories ? '▼' : '▶'}</span>
        </div>
        {expandedSections.categories && (
          <div style={styles.content}>
            <pre style={styles.jsonBlock}>
              {JSON.stringify(debugData.responses.categories, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Articles by Category */}
      {debugData.responses.articlesByCategory && (
        <div style={styles.section}>
          <div style={styles.sectionHeader} onClick={() => toggleSection('articlesByCategory')}>
            <h2>📄 Articles by Category</h2>
            <span style={styles.toggle}>{expandedSections.articlesByCategory ? '▼' : '▶'}</span>
          </div>
          {expandedSections.articlesByCategory && (
            <div style={styles.content}>
              {Object.entries(debugData.responses.articlesByCategory).map(([category, response]) => (
                <div key={category} style={styles.categoryBlock}>
                  <h3>
                    {category}
                    {response.status === 'success' ? (
                      <span style={styles.successBadge}>✓ {response.count || 0} items</span>
                    ) : (
                      <span style={styles.errorBadge}>✗ Error</span>
                    )}
                  </h3>
                  <pre style={styles.jsonBlock}>
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Testing Instructions */}
      <div style={styles.section}>
        <div style={styles.sectionHeader} onClick={() => toggleSection('testing')}>
          <h2>🧪 How to Test API</h2>
          <span style={styles.toggle}>{expandedSections.testing ? '▼' : '▶'}</span>
        </div>
        {expandedSections.testing && (
          <div style={styles.content}>
            <h3>Method 1: Browser Network Tab (Recommended)</h3>
            <ol>
              <li>Open DevTools: Press <code style={styles.code}>F12</code> or <code style={styles.code}>Ctrl+Shift+I</code></li>
              <li>Go to <strong>Network</strong> tab</li>
              <li>Reload this page: <code style={styles.code}>Ctrl+R</code></li>
              <li>Look for XHR/Fetch requests to your API endpoints</li>
              <li>Click each request to see:
                <ul>
                  <li><strong>Headers:</strong> URL, method, headers sent</li>
                  <li><strong>Request:</strong> Parameters sent to API</li>
                  <li><strong>Response:</strong> Actual data returned</li>
                </ul>
              </li>
            </ol>

            <h3>Method 2: This Dashboard</h3>
            <ol>
              <li>Expand the sections above to see API responses</li>
              <li>Check if status is 'success' or 'error'</li>
              <li>Look at the data structure returned</li>
            </ol>

            <h3>Method 3: Terminal Logs (During Build)</h3>
            <ol>
              <li>Run: <code style={styles.code}>npm run dev</code></li>
              <li>Look for logs starting with <code style={styles.code}>[ArticleService]</code></li>
              <li>Check for <code style={styles.code}>[STEP 1]</code> and <code style={styles.code}>[STEP 2]</code> logs in your terminal</li>
            </ol>

            <h3>What to Check</h3>
            <ul>
              <li>✅ Categories endpoint returns array of category names/IDs</li>
              <li>✅ Articles endpoint returns array of article objects with: id, slug, title, category, excerpt, image, date, author</li>
              <li>⚠️ Check if status codes are correct (200 for success, others for errors)</li>
              <li>⚠️ Verify data structure matches what getStaticProps expects</li>
            </ul>
          </div>
        )}
      </div>

      {/* Back Link */}
      <div style={styles.footer}>
        <a href="/" style={styles.link}>← Back to Home</a>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem'
  },
  subtitle: {
    marginTop: '0.5rem',
    fontSize: '0.95rem',
    opacity: 0.9
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid #ddd',
    overflow: 'hidden'
  },
  sectionHeader: {
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    userSelect: 'none'
  },
  sectionHeaderText: {
    margin: 0
  },
  toggle: {
    fontSize: '1.2rem',
    color: '#666'
  },
  content: {
    padding: '1.5rem'
  },
  jsonBlock: {
    backgroundColor: '#f4f4f4',
    padding: '1rem',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '500px',
    fontSize: '12px',
    lineHeight: '1.4',
    border: '1px solid #ddd',
    fontFamily: '"Courier New", monospace'
  },
  code: {
    backgroundColor: '#f4f4f4',
    padding: '0.2rem 0.4rem',
    borderRadius: '3px',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.9em'
  },
  successBadge: {
    display: 'inline-block',
    marginLeft: '1rem',
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  errorBadge: {
    display: 'inline-block',
    marginLeft: '1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  categoryBlock: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #eee'
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #ddd',
    textAlign: 'center'
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
    fontSize: '1rem'
  }
};
