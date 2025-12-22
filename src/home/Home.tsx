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
import {
  GitHub,
  Email,
  SportsTennis,
  FitnessCenter,
  Restaurant,
  Code,
  DataObject,
  Cloud,
  Language,
} from "@mui/icons-material";

const skills = [
  { name: "Go", level: 90, icon: Code },
  { name: "MySQL", level: 90, icon: DataObject },
  { name: "Python", level: 70, icon: Code },
  { name: "JavaScript / TypeScript", level: 70, icon: Code },
  { name: "React", level: 80, icon: DataObject },
  { name: "Kubernetes", level: 70, icon: Cloud },
  { name: "English", level: 70, icon: Language },
];

const hobbies = [
  {
    icon: SportsTennis,
    title: "羽毛球",
    description: "每周打",
  },
  {
    icon: FitnessCenter,
    title: "健身",
    description: "天天练",
  },
  {
    icon: Restaurant,
    title: "美食",
    description: "不解释了",
  },
  {
    title: "播客",
    icon: DataObject,
    description: "李诞 半拿铁 罗永浩的十字路口",
  },
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
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, color: "#000", letterSpacing: -1 }}
            >
              Nova Liu
            </Typography>

            <Typography variant="h6" sx={{ color: "#666", fontWeight: 300 }}>
              Developer
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "#888", maxWidth: 500, lineHeight: 1.8 }}
            >
              分享编程、技术、生活的故事
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
            sx={{ fontWeight: 600, mb: 4, textAlign: "center", color: "#000" }}
          >
            技能
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
                  <skill.icon sx={{ fontSize: 32, color: "#000", mt: 0.5 }} />
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

        <Divider />

        {/* Hobbies Section */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 4, textAlign: "center", color: "#000" }}
          >
            爱好
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            {hobbies.map((hobby) => (
              <Paper
                key={hobby.title}
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
                <hobby.icon sx={{ fontSize: 32, color: "#000", mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {hobby.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#666", lineHeight: 1.8 }}
                >
                  {hobby.description}
                </Typography>
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
