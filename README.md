# 🏠 Weekendly - Smart Weekend Planner

> **Transform your weekends from chaotic to curated** with Weekendly, the intuitive drag-and-drop weekend planning app that helps you design delightful Saturdays and Sundays in minutes.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)

## ✨ Overview

Weekendly is a modern, responsive web application that revolutionizes weekend planning through an elegant two-pane interface. Browse curated activity suggestions on the left, then drag-and-drop them into a visual timeline on the right to create perfectly balanced weekend schedules.

### 🎯 Key Features

- **🎨 Theme-Based Planning**: Choose from Lazy, Adventurous, or Family themes to get tailored activity suggestions
- **🖱️ Drag & Drop Interface**: Intuitive scheduling with visual feedback and conflict detection
- **📱 Fully Responsive**: Seamless experience across desktop, tablet, and mobile devices
- **💾 Smart Persistence**: Auto-save with undo/redo functionality and local storage
- **📤 Export & Share**: Export to calendar (.ics), JSON, or share via URL links
- **⌨️ Keyboard Shortcuts**: Power-user features for efficient planning
- **🎯 Mood-Based Activities**: Categorize activities by energy levels (Chill, Social, Energetic, Focus)
- **🔍 Smart Search**: Filter activities by category, mood, or custom search terms
- **➕ Custom Activities**: Add your own activities with full customization options

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weekend-planner-app-1.git
   cd weekend-planner-app-1
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

### 1. Choose Your Theme
Select from three carefully curated themes:
- **Lazy**: Relaxing, cozy activities for recharging
- **Adventurous**: High-energy, outdoor activities for thrill-seekers  
- **Family**: Kid-friendly activities perfect for family time

### 2. Browse Activities
- Use the search bar to find specific activities
- Filter by category (Relax, Adventure, Family)
- View activity details including duration, difficulty, and mood tags

### 3. Plan Your Weekend
- **Drag & Drop**: Drag activities from the browser to your weekend timeline
- **Auto-Scheduling**: Activities automatically snap to 15-minute time slots
- **Conflict Detection**: The app prevents scheduling conflicts
- **Edit Details**: Click any activity to modify time, duration, notes, or mood

### 4. Save & Share
- **Auto-Save**: Your plans are automatically saved locally
- **Export Options**: Download as calendar (.ics) or JSON
- **Share Links**: Generate shareable URLs that import plans automatically

## 🎨 Themes & Activities

### Lazy Weekend Theme
Perfect for relaxation and self-care:
- Morning Park Walk
- Cozy Movie Night
- Cafe Hop
- Museum Visit
- DIY Craft Session

### Adventurous Theme
For thrill-seekers and outdoor enthusiasts:
- Theme Park Thrills
- Trail Hike
- Arcade Hour
- Adventure Sports
- Outdoor Exploration

### Family Theme
Kid-friendly activities for quality family time:
- Family Brunch
- Picnic in the Meadow
- Board Game Night
- Educational Outings
- Creative Projects

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save current plan |
| `Cmd/Ctrl + E` | Export as JSON |
| `Cmd/Ctrl + Shift + E` | Export as calendar (.ics) |
| `Cmd/Ctrl + I` | Import plan |
| `Cmd/Ctrl + L` | Copy share link |
| `Cmd/Ctrl + Z` | Undo last change |
| `Cmd/Ctrl + Shift + Z` | Redo last change |
| `Cmd/Ctrl + Y` | Redo last change |
| `?` or `Cmd/Ctrl + /` | Open help dialog |

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks + Local Storage
- **Animations**: Framer Motion
- **Build Tool**: Turbopack (Next.js)

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── docs/              # Documentation page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── ActivityBrowser.tsx    # Activity browsing interface
│   ├── WeekendSchedule.tsx    # Timeline scheduling component
│   └── WeekendHeader.tsx      # Application header
├── lib/                   # Utility functions
└── hooks/                 # Custom React hooks
```

### Key Components

#### ActivityBrowser
- Displays curated activity suggestions
- Implements search and filtering functionality
- Handles drag-and-drop initiation
- Supports manual activity creation

#### WeekendSchedule
- Visual timeline for Saturday and Sunday
- Drag-and-drop target for activities
- Conflict detection and resolution
- Activity editing and management

#### WeekendHeader
- Theme selection interface
- Action buttons (save, load, export, share)
- Responsive navigation
- Keyboard shortcut integration

## 🎯 Features Deep Dive

### Smart Activity Suggestions
- **Curated Content**: Hand-picked activities for each theme
- **Mood-Based Filtering**: Activities tagged with energy levels
- **Difficulty Levels**: Easy, Medium, Hard classifications
- **Duration Estimates**: Realistic time allocations
- **Category Organization**: Relax, Adventure, Family groupings

### Advanced Scheduling
- **15-Minute Granularity**: Precise time slot management
- **Conflict Prevention**: Automatic overlap detection
- **Smart Positioning**: Auto-suggest optimal time slots
- **Visual Feedback**: Real-time drag preview and drop zones

### Data Persistence
- **Local Storage**: Browser-based data persistence
- **Theme-Specific Plans**: Separate plans for each theme
- **Undo/Redo History**: Complete change tracking
- **Auto-Save**: Seamless data preservation

### Export & Sharing
- **Calendar Integration**: .ics file generation with UTC timestamps
- **JSON Export**: Complete plan data for backup/import
- **Share Links**: URL-based plan sharing with auto-import
- **Cross-Platform**: Works with any calendar application

## 🎨 Design Philosophy

### User Experience
- **Intuitive Interface**: Minimal learning curve
- **Visual Hierarchy**: Clear information architecture
- **Responsive Design**: Consistent experience across devices
- **Accessibility**: WCAG-compliant design patterns

### Visual Design
- **Modern Aesthetics**: Clean, contemporary styling
- **Theme-Based Colors**: Distinctive visual identity per theme
- **Smooth Animations**: Delightful micro-interactions
- **Typography**: Readable, accessible font choices

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings (auto-detected)
3. Deploy with zero configuration

### Other Platforms
- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **Shadcn/ui** for the component library inspiration

## 📞 Support

- **Documentation**: [View Docs](http://localhost:3000/docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/weekend-planner-app-1/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/weekend-planner-app-1/discussions)

---

**Made with ❤️ for delightful weekends**

*Weekendly - Because every weekend deserves to be extraordinary.*