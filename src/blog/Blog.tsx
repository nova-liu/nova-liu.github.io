import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";
import { blogPosts } from "./blogConfig";
import NavigationBar from "../navigation/NavigationBar";
import "./Blog.css";

// Icons
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
);

export default function Blog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      const post = blogPosts.find((p) => p.id === id);
      if (post) {
        fetch(post.path)
          .then((res) => res.text())
          .then((text) => setMarkdown(text));
      } else {
        navigate("/blog");
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBackToArchive = () => {
    navigate("/blog");
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentPost = blogPosts.find((p) => p.id === id);

  return (
    <div className="blog">
      <NavigationBar />
      
      <main className="blog__content">
        <div className="blog__container">
          {/* Back Button */}
          <button className="blog__back-button" onClick={handleBackToArchive}>
            <ArrowLeftIcon />
            <span>返回文章列表</span>
          </button>

          {/* Article Header */}
          {currentPost && (
            <header className="blog__header">
              <h1 className="blog__title">{currentPost.title}</h1>
              <div className="blog__meta">
                <span className="blog__date">{currentPost.date}</span>
                {currentPost.tags && currentPost.tags.length > 0 && (
                  <div className="blog__tags">
                    {currentPost.tags.map((tag) => (
                      <span key={tag} className="blog__tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </header>
          )}

          {/* Article Content */}
          <article className="blog__article">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {markdown}
            </Markdown>
          </article>

          {/* Bottom Navigation */}
          <footer className="blog__footer">
            <button className="blog__back-button" onClick={handleBackToArchive}>
              <ArrowLeftIcon />
              <span>返回文章列表</span>
            </button>
          </footer>
        </div>

        {/* Scroll to Top Button */}
        <button
          className={`blog__scroll-top ${showScrollTop ? "blog__scroll-top--visible" : ""}`}
          onClick={handleScrollTop}
          aria-label="Scroll to top"
        >
          <ArrowUpIcon />
        </button>
      </main>
    </div>
  );
}
