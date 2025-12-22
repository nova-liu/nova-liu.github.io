import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";
import { blogPosts } from "./blogConfig";
import { Container, Box, Paper, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import NavigationBar from "../navigation/NavigationBar";

export default function Blog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      const post = blogPosts.find((p) => p.id === id);
      if (post) {
        fetch(post.path)
          .then((res) => res.text())
          .then((text) => setMarkdown(text));
      } else {
        // 如果找不到文章，返回归档页面
        navigate("/blog");
      }
    }
  }, [id, navigate]);

  const handleBackToArchive = () => {
    navigate("/blog");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <NavigationBar />
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <IconButton
            onClick={handleBackToArchive}
            sx={{
              mb: 3,
              color: "#000",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              bgcolor: "#fff",
              "& h1": {
                fontSize: "2.5rem",
                marginTop: "2rem",
                marginBottom: "1rem",
                borderBottom: "2px solid #eaecef",
                paddingBottom: "0.3rem",
                color: "#1a1a1a",
              },
              "& h2": {
                fontSize: "2rem",
                marginTop: "1.5rem",
                marginBottom: "0.8rem",
                color: "#1a1a1a",
              },
              "& p": {
                marginBottom: "1rem",
                fontSize: "1.05rem",
                lineHeight: 1.6,
              },
              "& img": {
                maxWidth: "100%",
                height: "auto",
                display: "block",
                margin: "2rem auto",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
              "& code": {
                backgroundColor: "#f6f8fa",
                padding: "0.2em 0.4em",
                borderRadius: "3px",
                fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
                fontSize: "0.9em",
              },
              "& pre": {
                backgroundColor: "#0d1117",
                padding: "1rem",
                borderRadius: "6px",
                overflowX: "auto",
                margin: "1.5rem 0",
              },
              "& pre code": {
                backgroundColor: "transparent",
                padding: 0,
                color: "#c9d1d9",
              },
              "& blockquote": {
                borderLeft: "4px solid #dfe2e5",
                paddingLeft: "1rem",
                margin: "1rem 0",
                color: "#6a737d",
                fontStyle: "italic",
              },
              "& strong": {
                fontWeight: 600,
                color: "#1a1a1a",
              },
              "& ul, & ol": {
                marginBottom: "1rem",
                paddingLeft: "2rem",
              },
              "& li": {
                marginBottom: "0.5rem",
              },
              "& a": {
                color: "#0366d6",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              },
            }}
          >
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {markdown}
            </Markdown>
          </Paper>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <IconButton
              onClick={handleBackToArchive}
              sx={{
                color: "#000",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
