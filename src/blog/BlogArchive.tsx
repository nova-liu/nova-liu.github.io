import { useNavigate } from "react-router-dom";
import { getArchiveGroups } from "./blogConfig";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { Article as ArticleIcon } from "@mui/icons-material";
import NavigationBar from "../navigation/NavigationBar";

export default function BlogArchive() {
  const navigate = useNavigate();
  const archives = getArchiveGroups();

  const getMonthName = (month: number) => {
    const months = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ];
    return months[month - 1];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <NavigationBar />
      <Box sx={{ pt: 8 }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600, color: "#000" }}
          ></Typography>

          {archives.map((yearGroup) => (
            <Box key={yearGroup.year} sx={{ mb: 6 }}>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: "#000",
                  borderBottom: "2px solid #000",
                  pb: 1,
                  mb: 3,
                }}
              >
                {yearGroup.year} 年
              </Typography>

              {yearGroup.months.map((monthGroup) => (
                <Box key={monthGroup.month} sx={{ mb: 4, ml: 2 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 500, mb: 2, color: "#000" }}
                  >
                    {getMonthName(monthGroup.month)}
                  </Typography>

                  <Stack spacing={2} sx={{ ml: 2 }}>
                    {monthGroup.posts.map((post) => (
                      <Card
                        key={post.id}
                        elevation={0}
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#000",
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() => navigate(`/blog/${post.id}`)}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="h4"
                                sx={{
                                  fontWeight: 600,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  flex: 1,
                                  color: "#000",
                                }}
                              >
                                <ArticleIcon
                                  sx={{ color: "#000" }}
                                  fontSize="small"
                                />
                                {post.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: "nowrap", color: "#666" }}
                              >
                                {formatDate(post.date)}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body1"
                              sx={{ mb: 2, color: "#666" }}
                            >
                              {post.description}
                            </Typography>

                            {post.tags && post.tags.length > 0 && (
                              <>
                                <Divider sx={{ mb: 1.5 }} />
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  gap={1}
                                >
                                  {post.tags.map((tag) => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                      sx={{
                                        bgcolor: "#f5f5f5",
                                        color: "#000",
                                        border: "1px solid #e0e0e0",
                                        "&:hover": {
                                          bgcolor: "#e0e0e0",
                                        },
                                      }}
                                    />
                                  ))}
                                </Stack>
                              </>
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          ))}
        </Container>
      </Box>
    </Box>
  );
}
