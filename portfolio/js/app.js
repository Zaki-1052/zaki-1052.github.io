/**
 * Portfolio Component Loader
 * Dynamically loads HTML components and populates them with data
 */

class PortfolioApp {
    constructor() {
        this.componentsPath = './components/';
        this.dataPath = './data/';
        this.contentPath = './content/';
        this.components = [
            'navigation',
            'hero',
            'about',
            'projects',
            'skills',
            'education',
            'contact',
            'visualizations',
            'features',
            'footer'
        ];
    }

    /**
     * Initialize the app
     */
    async init() {
        try {
            // Load all components
            await this.loadAllComponents();

            // Load data and populate components
            await this.loadData();

            // Initialize Alpine.js components after DOM is ready
            this.initializeAlpineComponents();

            // Setup smooth scrolling
            this.setupSmoothScrolling();

            console.log('Portfolio app initialized successfully');
        } catch (error) {
            console.error('Error initializing portfolio app:', error);
        }
    }

    /**
     * Load all HTML components
     */
    async loadAllComponents() {
        const loadPromises = this.components.map(async (component) => {
            const container = document.getElementById(`${component}-section`);
            if (!container) {
                console.warn(`Container for ${component} not found`);
                return;
            }

            try {
                const response = await fetch(`${this.componentsPath}${component}.html`);
                if (!response.ok) throw new Error(`Failed to load ${component}`);

                const html = await response.text();
                container.innerHTML = html;
            } catch (error) {
                console.error(`Error loading ${component}:`, error);
            }
        });

        await Promise.all(loadPromises);
    }

    /**
     * Load data from JSON files and populate components
     */
    async loadData() {
        try {
            // Load projects data
            const projectsData = await this.fetchJSON('projects.json');
            if (projectsData) this.populateProjects(projectsData);

            // Load skills data
            const skillsData = await this.fetchJSON('skills.json');
            if (skillsData) this.populateSkills(skillsData);

            // Load education data
            const educationData = await this.fetchJSON('education.json');
            if (educationData) this.populateEducation(educationData);

            // Load contact data
            const contactData = await this.fetchJSON('contact.json');
            if (contactData) this.populateContact(contactData);

            // Load about content from markdown
            await this.loadMarkdownContent();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    /**
     * Fetch JSON data
     */
    async fetchJSON(filename) {
        try {
            const response = await fetch(`${this.dataPath}${filename}`);
            if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${filename}:`, error);
            return null;
        }
    }

    /**
     * Populate projects section with data
     */
    populateProjects(data) {
        // Store data globally for Alpine.js to access
        window.portfolioData = window.portfolioData || {};
        window.portfolioData.projects = data;
    }

    /**
     * Populate skills section with data
     */
    populateSkills(data) {
        window.portfolioData = window.portfolioData || {};
        window.portfolioData.skills = data;
    }

    /**
     * Populate education section with data
     */
    populateEducation(data) {
        window.portfolioData = window.portfolioData || {};
        window.portfolioData.education = data;
    }

    /**
     * Populate contact section with data
     */
    populateContact(data) {
        window.portfolioData = window.portfolioData || {};
        window.portfolioData.contact = data;
    }

    /**
     * Load markdown content
     */
    async loadMarkdownContent() {
        try {
            // Load about content
            const aboutResponse = await fetch(`${this.contentPath}about.md`);
            if (aboutResponse.ok) {
                const aboutMarkdown = await aboutResponse.text();
                window.portfolioData = window.portfolioData || {};
                window.portfolioData.aboutContent = this.parseMarkdown(aboutMarkdown);
            }
        } catch (error) {
            console.error('Error loading markdown content:', error);
        }
    }

    /**
     * Simple markdown parser (converts basic markdown to HTML)
     */
    parseMarkdown(markdown) {
        return markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.+)$/gim, '<p>$1</p>')
            .replace(/<\/p><p><h/g, '</p><h')
            .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    }

    /**
     * Initialize Alpine.js components
     */
    initializeAlpineComponents() {
        // These will be defined in components.js
        console.log('Alpine components ready');
    }

    /**
     * Setup smooth scrolling for navigation
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    app.init();
});

// Export for use in other modules
export default PortfolioApp;
