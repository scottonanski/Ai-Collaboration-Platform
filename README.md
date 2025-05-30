# AI-Powered Code Collaboration Workspace

A modern, interactive development environment that combines AI-assisted coding with real-time collaboration features. This project provides a rich interface for writing, testing, and debugging code with AI assistance.

![Screenshot of the application](https://via.placeholder.com/800x500/1e293b/ffffff?text=AI+Code+Workspace)

## 🚀 Features

### ✨ Code Editor
- **Monaco Editor** integration with syntax highlighting for multiple languages
- Support for HTML, CSS, and JavaScript/TypeScript
- Real-time code execution and preview
- File upload/download functionality
- Line numbers and code folding

### 🤖 AI Integration
- AI-assisted code completion and suggestions
- Interactive chat interface for code discussions
- Context-aware code generation and modification
- Support for multiple AI models

### 🛠️ Development Tools
- Built-in code execution environment
- Responsive design with resizable panels
- Dark/light theme support
- Keyboard shortcuts for common actions
- Integrated terminal (coming soon)

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, DaisyUI
- **Code Editing**: Monaco Editor
- **State Management**: Zustand
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/scottonanski/ai-testing.git
   cd ai-testing
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Start the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. **Open in your browser**
   The application will be available at `http://localhost:5173`

## 🧪 Testing

Run the test suite with:

```bash
yarn test
# or
npm test
```

## 📦 Building for Production

To create a production build:

```bash
yarn build
# or
npm run build
```

## 🛠️ Project Structure

```
src/
├── components/         # Reusable React components
│   ├── ChatInterface/  # Chat interface components
│   ├── Drawers/       # Sidebar and code editor components
│   └── ...
├── services/          # API and service integrations
├── store/             # State management
└── utils/             # Utility functions and helpers
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ by Scott Onanski
