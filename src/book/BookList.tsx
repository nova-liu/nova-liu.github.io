import { Container, Box, Typography } from "@mui/material";
import { MenuBook as BookIcon } from "@mui/icons-material";
import NavigationBar from "../navigation/NavigationBar";
import { books } from "./bookConfig";

export default function BookList() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <NavigationBar />
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600, color: "#000" }}
          ></Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(5, 1fr)",
              },
              gap: 4,
            }}
          >
            {books.map((book) => (
              <Box
                key={book.id}
                component="a"
                href={book.doubanUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "block",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    opacity: 0.8,
                  },
                }}
              >
                {/* Book Cover */}
                <Box
                  component="img"
                  src={book.coverImage}
                  alt={`Book ${book.id}`}
                  sx={{
                    width: "100%",
                    aspectRatio: "3/4",
                    objectFit: "cover",
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      (e.target as HTMLImageElement).nextSibling as HTMLElement
                    ).style.display = "flex";
                  }}
                />
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "3/4",
                    bgcolor: "#f5f5f5",
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                  }}
                >
                  <BookIcon sx={{ fontSize: 60, color: "#ccc" }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
