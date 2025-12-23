import {
  Container,
  Box,
  Typography,
  Stack,
  IconButton,
  LinearProgress,
  Divider,
  Paper,
} from "@mui/material";
import NavigationBar from "../navigation/NavigationBar";
import { GitHub, Email } from "@mui/icons-material";

const skills = [
  { name: "Go", level: 90, logo: "/logos/golang.svg" },
  { name: "MySQL", level: 90, logo: "/logos/mysql.svg" },
  { name: "Python", level: 80, logo: "/logos/python.svg" },
  { name: "JavaScript / TypeScript", level: 70, logo: "/logos/js.svg" },
  { name: "React", level: 70, logo: "/logos/React.svg" },
  { name: "Kubernetes", level: 80, logo: "/logos/kubernetes.svg" },
  { name: "English", level: 70, logo: "/logos/english-input.svg" },
  { name: "Mandarin", level: 100, logo: "/logos/icon_Chinese.svg" },
];

const socialLinks = [
  { icon: GitHub, href: "https://github.com/nova-liu", label: "GitHub" },
  { icon: Email, href: "mailto:zhixizhixizhixi@gmail.com", label: "Email" },
];

export default function Home() {
  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh" }}>
      <NavigationBar />
      <Box sx={{ pt: 8 }}>
        {/* Hero Section */}
        <Container maxWidth="md">
          <Stack
            spacing={4}
            alignItems="center"
            sx={{ pt: 12, pb: 8, textAlign: "center" }}
          >
            <Typography variant="h6" sx={{ color: "#666", fontWeight: 300 }}>
              My name is Nova Liu
            </Typography>

            <Typography variant="h6" sx={{ color: "#666", fontWeight: 300 }}>
              I am a Service Developer · Web Developer · Badminton Lover
            </Typography>

            <Stack direction="row" spacing={1}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  sx={{
                    color: "#000",
                    "&:hover": { bgcolor: "#f0f0f0" },
                  }}
                >
                  <social.icon />
                </IconButton>
              ))}
            </Stack>
          </Stack>
        </Container>

        <Divider />

        {/* Skills Section */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 4, textAlign: "center", color: "#666" }}
          >
            my skills
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            {skills.map((skill) => (
              <Paper
                key={skill.name}
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#000",
                    transition: "border-color 0.2s",
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    component="img"
                    src={skill.logo}
                    alt={skill.name}
                    sx={{ width: 32, height: 32, mt: 0.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 1.5 }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {skill.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {skill.level}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={skill.level}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: "#000",
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Container>

        {/* Footer */}
        <Divider />
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#999" }}>
            © {new Date().getFullYear()} Nova Liu
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
