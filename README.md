# Nova Liu's Blog & Book Site

This is a personal website built with **React**, **TypeScript**, and **Vite**. It features a blog and book archive, with content written in Markdown and rendered dynamically. The site is designed for fast performance, modern UI, and easy content management.

## Features

- ⚡️ Fast, modern React + Vite stack
- 📚 Blog and book sections, with Markdown support
- 📝 Easy content updates via Markdown files
- 🌈 Material UI for a clean, responsive design
- 🔍 Syntax highlighting for code blocks
- 🗂 Organized folder structure for scalability

## Tech Stack

- [React](https://react.dev/) 19
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI](https://mui.com/)
- [React Router](https://reactrouter.com/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Highlight.js](https://highlightjs.org/) for code

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
git clone https://github.com/nova-liu/nova-liu.github.io.git
cd nova-liu.github.io
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view the site.

### Build

```bash
npm run build
# or
yarn build
```

### Lint

```bash
npm run lint
# or
yarn lint
```

## Project Structure

```
├── public/
│   ├── blogs/           # Blog posts in Markdown
│   ├── book/            # Book content in Markdown
│   └── logos/           # Site logos and images
├── src/
│   ├── blog/            # Blog components & config
│   ├── book/            # Book components & config
│   ├── home/            # Home page
│   ├── navigation/      # Navigation bar
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html           # HTML template
├── package.json         # Project metadata & scripts
├── vite.config.ts       # Vite configuration
└── README.md            # This file
```

## Content Management

- Add blog posts to `public/blogs/<topic>/<post>.md`
- Add book content to `public/book/`
- Update navigation and config in `src/blog/blogConfig.ts` and `src/book/bookConfig.ts`

## Contributing

Pull requests and issues are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
