import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function NavigationBar() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#fff",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            color: "#000",
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { color: "#666" },
          }}
        >
          Nova Liu
        </Typography>
        <Button
          component={Link}
          to="/blog"
          sx={{
            ml: 6,
            color: "#000",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          技术文章
        </Button>
        <Button
          component={Link}
          to="/book"
          sx={{
            ml: 2,
            color: "#000",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          书籍
        </Button>
      </Toolbar>
    </AppBar>
  );
}
