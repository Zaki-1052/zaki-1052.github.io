# Portfolio Components

This directory contains modularized HTML components extracted from the main index.html file.

## Component Files Created:

### 1. navigation.html
- **Lines**: 140-243
- **Content**: Scroll progress bar, nav element with logo, desktop menu, mobile menu button, and mobile dropdown
- **Alpine.js**: Uses `scrollProgress` and `navigation` x-data components
- **Features**: Dark mode toggle, responsive mobile menu

### 2. hero.html
- **Lines**: 245-357
- **Content**: Header section with name, dynamic typing effect, CTA buttons, quick stats, reading time, profile image
- **Alpine.js**: Uses typing animation and `calculateReadingTime()` x-data
- **Features**: Animated text, hover effects, responsive grid

### 3. about.html
- **Lines**: 362-690
- **Content**: Expandable cards for academic background, research interests, and goals; bio text, skills grid, tech stack card
- **Alpine.js**: Uses `expandAll` state management for collapsible sections
- **Features**: Interactive collapsible cards, comprehensive tech stack

### 4. projects.html (To be created)
- **Lines**: 693-1179
- **Content**: Filter buttons and all project cards
- **Data Source**: Should load from `data/projects.json`
- **Comment**: `<!-- Projects will be loaded from data/projects.json -->`
- **Features**: Project filtering, GitHub/Other/Future project categories

### 5. skills.html (To be created)
- **Lines**: 1182-1743
- **Content**: Category filters and skill items across multiple categories
- **Data Source**: Should load from `data/skills.json`
- **Comment**: `<!-- Skills will be loaded from data/skills.json -->`
- **Features**: Skill category filtering, progress bars, competency levels

### 6. education.html (To be created)
- **Lines**: 1745-2053
- **Content**: Education timeline, coursework, certifications
- **Data Source**: Could load from `data/education.json`
- **Comment**: `<!-- Education data could be loaded from data/education.json -->`
- **Features**: Timeline visualization, course listings

### 7. contact.html (To be created)
- **Lines**: 2057-2293
- **Content**: Contact information, social links, contact form
- **Data Source**: Could load from `data/contact.json`
- **Comment**: `<!-- Contact information could be loaded from data/contact.json -->`
- **Features**: Form validation, reCAPTCHA, social media links

### 8. visualizations.html (To be created)
- **Lines**: 2295-2400
- **Content**: 4 visualization containers (skills network, language chart, DNA viewer, project timeline)
- **Features**: Interactive D3.js/Chart.js visualizations

### 9. features.html (To be created)
- **Lines**: 2403-2553
- **Content**: Feature grid and technical stats
- **Features**: Hover effects, technical metrics display

### 10. footer.html (To be created)
- **Lines**: 2557-2613
- **Content**: Footer with creator info, quick links, source code link, copyright
- **Features**: Dynamic copyright year calculation

## Usage

To use these components in the main index.html file, you can:

1. **Server-side includes** (PHP, Node.js, etc.)
2. **JavaScript dynamic loading**
3. **Build tools** (webpack, Vite, etc.)
4. **Template engines** (Handlebars, EJS, etc.)

## Notes

- All components maintain their Alpine.js directives
- All Tailwind CSS classes are preserved
- SVG icons are included in each component
- Components are complete, standalone HTML fragments
- Dark mode support is maintained across all components
