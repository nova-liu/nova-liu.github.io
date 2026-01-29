import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { filterPostsByTag, getAllTags } from "./blogConfig";
import NavigationBar from "../navigation/NavigationBar";
import "./BlogArchive.css";

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function BlogArchive() {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const archives = filterPostsByTag(selectedTag);
  const allTags = getAllTags();

  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="blog-archive">
      <NavigationBar />

      <main className="blog-archive__content">
        <div className="blog-archive__container">
          {/* Header */}
          <header className="blog-archive__header">
            <h1 className="blog-archive__title">
              <span className="blog-archive__title-icon"></span>
              Tech Blog
            </h1>
          </header>

          {/* Tags Filter */}
          <div className="blog-archive__filter">
            <button
              className={`blog-archive__tag ${
                selectedTag === null ? "blog-archive__tag--active" : ""
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`blog-archive__tag ${
                  selectedTag === tag ? "blog-archive__tag--active" : ""
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="blog-archive__posts">
            {archives.length === 0 ? (
              <div className="blog-archive__empty">
                <span className="blog-archive__empty-icon">🔍</span>
                <p>no posts found</p>
              </div>
            ) : (
              archives.map((yearGroup) => (
                <section
                  key={yearGroup.year}
                  className="blog-archive__year-group"
                >
                  <h2 className="blog-archive__year">{yearGroup.year}</h2>

                  {yearGroup.months.map((monthGroup) => (
                    <div
                      key={monthGroup.month}
                      className="blog-archive__month-group"
                    >
                      <h3 className="blog-archive__month">
                        {getMonthName(monthGroup.month)}
                      </h3>

                      <div className="blog-archive__post-list">
                        {monthGroup.posts.map((post, index) => (
                          <article
                            key={post.id}
                            className="blog-archive__post-card"
                            onClick={() => navigate(`/blog/${post.id}`)}
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="blog-archive__post-content">
                              <h4 className="blog-archive__post-title">
                                {post.title}
                              </h4>
                              <p className="blog-archive__post-description">
                                {post.description}
                              </p>

                              <div className="blog-archive__post-meta">
                                <span className="blog-archive__post-date">
                                  <CalendarIcon />
                                  {formatDate(post.date)}
                                </span>

                                {post.tags && post.tags.length > 0 && (
                                  <div className="blog-archive__post-tags">
                                    {post.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className={`blog-archive__post-tag ${
                                          selectedTag === tag
                                            ? "blog-archive__post-tag--active"
                                            : ""
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedTag(tag);
                                        }}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
