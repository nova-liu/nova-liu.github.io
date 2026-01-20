import NavigationBar from "../navigation/NavigationBar";
import { books } from "./bookConfig";
import "./BookList.css";

// Book Icon
const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function BookList() {
  return (
    <div className="book-list">
      <NavigationBar />

      <main className="book-list__content">
        <div className="book-list__container">
          {/* Header */}
          <header className="book-list__header">
            <h1 className="book-list__title">
              <span className="book-list__title-icon"></span>
              Books
            </h1>
            <p className="book-list__description">
              These are some of my favorite books on programming, technology,
              and life. Click on the book covers to view more details on Douban.
            </p>
          </header>

          {/* Book Grid */}
          <div className="book-list__grid">
            {books.map((book, index) => (
              <a
                key={book.id}
                href={book.doubanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="book-list__card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="book-list__cover">
                  <img
                    src={book.coverImage}
                    alt={`Book ${book.id}`}
                    className="book-list__cover-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div className="book-list__cover-fallback">
                    <BookIcon />
                  </div>
                </div>

                {/* <div className="book-list__info">
                  <h3 className="book-list__book-title">{book.title}</h3>
                  <p className="book-list__author">{book.author}</p>
                </div> */}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
