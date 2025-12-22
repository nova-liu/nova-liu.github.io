import { Routes, Route } from "react-router-dom";
import Home from "./home/Home.tsx";
import Blog from "./blog/Blog.tsx";
import BlogArchive from "./blog/BlogArchive.tsx";
import BookList from "./book/BookList.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<BlogArchive />} />
      <Route path="/blog/:id" element={<Blog />} />
      <Route path="/book" element={<BookList />} />
    </Routes>
  );
}

export default App;
