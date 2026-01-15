import NavigationBar from "../navigation/NavigationBar";
import "./Home.css";

// SVG Icons
const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

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
  { icon: GitHubIcon, href: "https://github.com/nova-liu", label: "GitHub" },
  { icon: EmailIcon, href: "mailto:zhixizhixizhixi@gmail.com", label: "Email" },
];

export default function Home() {
  return (
    <div className="home">
      <NavigationBar />
      
      <main className="home__content">
        {/* Hero Section */}
        <section className="home__hero">
          <div className="home__hero-island">
            <div className="home__avatar">
              <span className="home__avatar-emoji">👋</span>
            </div>
            <h1 className="home__title">Hi, I'm Nova Liu</h1>
            <p className="home__subtitle">
              Service Developer · Web Developer · Badminton Lover
            </p>
            <div className="home__social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={social.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className="home__social-link"
                  aria-label={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="home__skills">
          <div className="home__skills-container">
            <h2 className="home__section-title">
              <span className="home__section-title-icon">⚡</span>
              Skills
            </h2>
            
            <div className="home__skills-grid">
              {skills.map((skill, index) => (
                <div 
                  key={skill.name} 
                  className="home__skill-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="home__skill-header">
                    <img
                      src={skill.logo}
                      alt={skill.name}
                      className="home__skill-logo"
                    />
                    <span className="home__skill-name">{skill.name}</span>
                    <span className="home__skill-level">{skill.level}%</span>
                  </div>
                  <div className="home__skill-bar">
                    <div 
                      className="home__skill-bar-fill"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="home__footer">
          <p className="home__footer-text">
            © {new Date().getFullYear()} Nova Liu · Built with React
          </p>
        </footer>
      </main>
    </div>
  );
}
