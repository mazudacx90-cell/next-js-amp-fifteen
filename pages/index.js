// pages/index.js
import ArticleService from '@/lib/services/articleService';
import i18n from '@/lib/i18n/i18n';

export const config = { amp: true };

// Mock fallback data for AMP rendering
const fallbackArticles = [
  {
    canonical: "getting-started-with-amp",
    title: "Getting Started with AMP",
    category: "Technology",
    excerpt: "Learn the basics of building fast mobile pages with AMP.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=400&fit=crop",
    date: "2024-01-15",
    author: "John Doe"
  },
  {
    canonical: "amp-best-practices",
    title: "AMP Best Practices for 2025",
    category: "Technology",
    excerpt: "Discover the latest best practices for optimizing AMP pages.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    date: "2024-01-20",
    author: "Jane Smith"
  },
  {
    canonical: "web-performance-tips",
    title: "Web Performance Tips",
    category: "Performance",
    excerpt: "Improve your website speed with these essential performance tips.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=400&fit=crop",
    date: "2024-01-25",
    author: "Mike Johnson"
  }
];

const fallbackCategories = ["Technology", "Performance", "Design"];

export async function getStaticProps() {
  let categories = [...fallbackCategories];
  let articlesByCategory = {};

  // STEP 1: Fetch all categories
  try {
    const categoriesResponse = await ArticleService.getCategories({
      "parentId" : 0
    });
    
    if (categoriesResponse.status === 'success' && categoriesResponse.data && categoriesResponse.data.data && Array.isArray(categoriesResponse.data.data) && categoriesResponse.data.data.length > 0) {
      // Extract category objects from nested data structure
      const categoryObjects = categoriesResponse.data.data;
      categories = categoryObjects; // Store the full objects with id, name, canonical
      //console.log(`[STEP 1] ✅ Successfully fetched ${categories.length} categories:`, categories.map(c => c.name || c.canonical));
    } else {
      //console.warn("[STEP 1] ⚠️ No categories from API, using fallback");
      categories = fallbackCategories.map(name => ({ name, canonical: name.toLowerCase() }));
    }
  } catch (error) {
    //console.error("[STEP 1] ❌ Error fetching categories:", error.message);
    categories = fallbackCategories.map(name => ({ name, canonical: name.toLowerCase() }));
  }

  // STEP 2: Fetch articles for each category
  try {
    for (const categoryObj of categories) {
      // Use canonical field as category key for API
      const categoryKey = categoryObj.canonical || categoryObj.name;
      const displayName = categoryObj.name || categoryObj.canonical;
      
      const articleResponse = await ArticleService.getArticlesByCategory(categoryKey, {
        page: 1,
        limit: 50,
        language: "en"
      });
      
      if (articleResponse.status === 'success' && Array.isArray(articleResponse.data) && articleResponse.data.length > 0) {
        articlesByCategory[displayName] = articleResponse.data;
        //console.log(`[STEP 2] ✅ Got ${articleResponse.data.length} articles for "${displayName}"`);
      } else {
        //console.warn(`[STEP 2] ⚠️ No articles for "${displayName}", using fallback`);
        articlesByCategory[displayName] = fallbackArticles.filter(a => a.category === displayName);
      }
    }
  } catch (error) {
    //console.error("[STEP 2] ❌ Error fetching articles by category:", error.message);
    // Create fallback structure
    categories.forEach(categoryObj => {
      const displayName = categoryObj.name || categoryObj.canonical;
      articlesByCategory[displayName] = fallbackArticles.filter(a => a.category === displayName);
    });
  }

  // Initialize i18n
  await i18n.init('en');

  return {
    props: {
      categories: categories || fallbackCategories.map(name => ({ name, canonical: name.toLowerCase() })),
      articlesByCategory: articlesByCategory || {}
    },
    revalidate: 10 // ISR: revalidate every 10 seconds for fresh data
  };
}

export default function HomePage({ categories = fallbackCategories, articlesByCategory = {} }) {
  const firstCategory = categories?.[0];
  const firstCategoryId = String(
    typeof firstCategory === 'string'
      ? firstCategory
      : (firstCategory?.canonical || firstCategory?.name || '')
  ).toLowerCase();

  return (
    <>
      <amp-state id="selectedCategoryState">
        <script type="application/json">
          {`{ "selected": "${firstCategoryId}" }`}
        </script>
      </amp-state>

      <div className="container">
        {/* Hero Section */}
        <div className="hero">
          <h1>Welcome to Our Blog</h1>
          <p>Discover articles about web development, performance, and design</p>
          <amp-img
            src="https://www.toprankindonesia.com/wp-content/uploads/2025/07/Accelerated-Mobile-Pages-.png"
            alt="Blog Hero"
            width="1200"
            height="400"
            layout="responsive"
            className="hero-img"
          />
        </div>

        {/* Category Tabs */}
        <amp-selector
          className="category-tabs"
          role="tablist"
          aria-label="Categories"
          on="select:AMP.setState({ selectedCategoryState: { selected: event.targetOption } })"
        >
          {categories.map((categoryObj, index) => {
            const displayName =
              typeof categoryObj === 'string'
                ? categoryObj
                : (categoryObj?.name || categoryObj?.canonical || '');
            const canonical =
              typeof categoryObj === 'string'
                ? categoryObj
                : (categoryObj?.canonical || categoryObj?.name || '');
            const categoryId = String(canonical || displayName).toLowerCase();

            return (
              <a
                key={categoryId}
                role="tab"
                className="tab-button"
                option={categoryId}
                {...(index === 0 && { selected: '' })}
              >
                {displayName}
              </a>
            );
          })}
        </amp-selector>

        {/* Articles by Category */}
        {categories.map((categoryObj) => {
          const displayName =
            typeof categoryObj === 'string'
              ? categoryObj
              : (categoryObj?.name || categoryObj?.canonical || '');
          const canonical =
            typeof categoryObj === 'string'
              ? categoryObj
              : (categoryObj?.canonical || categoryObj?.name || '');
          const categoryId = String(canonical || displayName).toLowerCase();
          const isHidden = categoryId !== firstCategoryId;

          return (
            <section
              key={categoryId}
              id={categoryId}
              className="category-section"
              hidden={isHidden}
              // FIX: Using string concatenation instead of backticks to avoid parser confusion
              data-amp-bind-hidden={"selectedCategoryState.selected != '" + categoryId + "'"}
            >
              <h2 className="category-heading">
                {displayName} Articles
              </h2>
              <div className="articles-grid">
                {articlesByCategory[displayName]?.map((article) => {
                  // Handle date formatting here, safely outside the return block
                  const dateString = article.date ? new Date(article.date).toLocaleDateString() : '';

                  return (
                    <a key={article.canonical} href={`/articles/${article.canonical}`} className="article-card">
                      {article.image ? (
                        <amp-img src={article.image} alt={article.title} width="400" height="225" layout="responsive" className="article-image"/>
                      ) : (
                        <div className="article-image-placeholder">No image</div>
                      )}
                      <div className="article-content">
                        <span className="article-category">{article.category}</span>
                        <h3 className="article-title">{article.title}</h3>
                        <p className="article-excerpt">{article.upperdeck}</p>
                        <div className="article-meta">
                          <span>{dateString}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
