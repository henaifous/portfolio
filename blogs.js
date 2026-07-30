const blogDirectory = "blogs";

const fetchBlogJson = async (path) => {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load ${path} (${response.status}).`);
  }

  return response.json();
};

const formatBlogDate = (value) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const assertArticle = (article) => {
  const requiredTextFields = ["slug", "title", "summary", "publishedAt", "readingTime"];
  const hasRequiredText = requiredTextFields.every(
    (field) => typeof article[field] === "string" && article[field].trim()
  );

  if (
    !hasRequiredText ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) ||
    !Array.isArray(article.tags) ||
    !article.tags.every((tag) => typeof tag === "string") ||
    !Array.isArray(article.content)
  ) {
    throw new Error("An article does not match blogs/article.schema.json.");
  }

  return article;
};

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
};

const createTagList = (tags, className) => {
  const list = document.createElement("ul");
  list.className = className;

  tags.forEach((tag) => {
    list.append(createTextElement("li", "", tag));
  });

  return list;
};

const createBlogCard = (article) => {
  const card = document.createElement("article");
  card.className = "blog-card";

  const meta = document.createElement("div");
  meta.className = "blog-card__meta";
  meta.append(
    createTextElement("time", "", formatBlogDate(article.publishedAt)),
    createTextElement("span", "", article.readingTime)
  );

  const title = createTextElement("h3", "", article.title);
  const summary = createTextElement("p", "", article.summary);
  const tags = createTagList(article.tags, "blog-card__tags");
  const link = createTextElement("a", "blog-card__link", "Read article");
  link.href = `blog.html?article=${encodeURIComponent(article.slug)}`;
  link.setAttribute("aria-label", `Read ${article.title}`);

  card.append(meta, title, summary, tags, link);
  return card;
};

const loadBlogList = async (container) => {
  try {
    const manifest = await fetchBlogJson(`${blogDirectory}/index.json`);

    if (!Array.isArray(manifest.articles) || !manifest.articles.length) {
      container.replaceChildren(createTextElement("p", "blog-status", "No articles published yet."));
      return;
    }

    const articles = await Promise.all(
      manifest.articles.map((fileName) => {
        if (!/^[a-z0-9-]+\.json$/.test(fileName)) {
          throw new Error(`Invalid article filename: ${fileName}`);
        }

        return fetchBlogJson(`${blogDirectory}/${fileName}`).then(assertArticle);
      })
    );

    articles.sort((first, second) => second.publishedAt.localeCompare(first.publishedAt));
    container.replaceChildren(...articles.map(createBlogCard));
  } catch (error) {
    console.error(error);
    container.replaceChildren(
      createTextElement("p", "blog-status", "Articles could not be loaded. Please try again later.")
    );
  }
};

const renderContentBlock = (block) => {
  if (!block || typeof block.type !== "string") {
    throw new Error("Invalid article content block.");
  }

  if (block.type === "paragraph") {
    return createTextElement("p", "", block.text);
  }

  if (block.type === "heading") {
    return createTextElement(block.level === 3 ? "h3" : "h2", "", block.text);
  }

  if (block.type === "quote") {
    return createTextElement("blockquote", "", block.text);
  }

  if (block.type === "list" && Array.isArray(block.items)) {
    const list = document.createElement("ul");
    block.items.forEach((item) => list.append(createTextElement("li", "", item)));
    return list;
  }

  throw new Error(`Unsupported article content block: ${block.type}`);
};

const renderArticle = (container, article) => {
  const header = document.createElement("header");
  header.className = "article-header";

  const meta = document.createElement("div");
  meta.className = "article-header__meta";
  const time = createTextElement("time", "", formatBlogDate(article.publishedAt));
  time.dateTime = article.publishedAt;
  meta.append(time, createTextElement("span", "", article.readingTime));

  header.append(
    createTextElement("p", "eyebrow", "Mobile Engineering Notes"),
    createTextElement("h1", "", article.title),
    createTextElement("p", "article-header__summary", article.summary),
    createTagList(article.tags, "blog-card__tags article-tags"),
    meta
  );

  const content = document.createElement("div");
  content.className = "article-content";
  content.append(...article.content.map(renderContentBlock));

  container.replaceChildren(header, content);
  document.title = `${article.title} | Soufiane H.`;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = article.summary;
  }
};

const loadArticle = async (container) => {
  const slug = new URLSearchParams(window.location.search).get("article");

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    container.replaceChildren(
      createTextElement("p", "blog-status", "This article address is invalid.")
    );
    return;
  }

  try {
    const article = assertArticle(
      await fetchBlogJson(`${blogDirectory}/${encodeURIComponent(slug)}.json`)
    );

    if (article.slug !== slug) {
      throw new Error("The article slug does not match its filename.");
    }

    renderArticle(container, article);
  } catch (error) {
    console.error(error);
    container.replaceChildren(
      createTextElement("p", "blog-status", "This article could not be found or loaded.")
    );
  }
};

const blogList = document.querySelector("#blog-list");
const blogArticle = document.querySelector("#blog-article");

if (blogList) {
  loadBlogList(blogList);
}

if (blogArticle) {
  loadArticle(blogArticle);
}
