// Alpine.js Component Initializations
document.addEventListener('alpine:init', () => {
    // Navigation Component
    Alpine.data('navigation', () => ({
        isDark: localStorage.getItem('darkMode') === 'true' || 
                (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches),
        isOpen: false,
        init() {
            // Add this init function to watch for dark mode changes
            this.$watch('isDark', value => {
                if (value) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                localStorage.setItem('darkMode', value.toString());
            });
        },
        toggleMenu() {
            this.isOpen = !this.isOpen;
            document.body.style.overflow = this.isOpen ? 'hidden' : '';
        },
        toggleDark() {
            this.isDark = !this.isDark;
        }
    }));

    // Clipboard Component
Alpine.data('clipboard', () => ({
    copied: false,
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.copied = true;
            setTimeout(() => this.copied = false, 2000);
        });
    }
}));

// Scroll Progress Component
Alpine.data('scrollProgress', () => ({
    percentage: 0,
    init() {
        this.updateProgress(); // Initial calculation
        window.addEventListener('scroll', () => this.updateProgress());
    },
    updateProgress() {
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollTop = window.scrollY;
        this.percentage = Math.min(100, Math.round((scrollTop / docHeight) * 100));
    }
}));

    // Page Transitions Component
    Alpine.data('pageTransitions', () => ({
        init() {
            // Create intersection observer
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Add both opacity and animation classes
                            entry.target.classList.remove('opacity-0');
                            entry.target.classList.add('opacity-100');
                            entry.target.classList.add('animate-fadeIn');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    root: null,
                    rootMargin: '50px',
                    threshold: 0.1
                }
            );

            // Observe all sections
            document.querySelectorAll('section, footer').forEach(element => {
                observer.observe(element);
            });
        }
    }));
});



// Dark mode handling - Initial check
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved dark mode preference or system preference
    if (localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    // Smooth scroll handling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Scroll to top button functionality
window.onscroll = function() {
    const scrollButton = document.getElementById('scroll-to-top');
    if (scrollButton) {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollButton.classList.remove('hidden');
        } else {
            scrollButton.classList.add('hidden');
        }
    }
};

// Mobile menu functionality
function mobileMenu() {
    return {
        show: false,
        toggle() {
            this.show = !this.show;
            document.body.style.overflow = this.show ? 'hidden' : '';
        }
    };
}

// Reading Time Estimation
function calculateReadingTime() {
    return {
        readingTime: 0,
        init() {
            // Get all text content from main sections
            const content = document.querySelector('main').innerText;
            const wordsPerMinute = 260; // Average reading speed
            const words = content.trim().split(/\s+/).length;
            this.readingTime = Math.ceil(words / wordsPerMinute);
            
            // Log for debugging
            console.log('Word count:', words);
            console.log('Reading time:', this.readingTime);
        }
    };
}

// Contact form functionality
function contactForm() {
    return {
        form: {
            firstName: '',
            lastName: '',
            email: '',
            subject: '',
            message: ''
        },
        errors: {},
        loading: false,
        formStatus: {
            show: false,
            success: false,
            message: ''
        },
        attempts: 0,
        hasSubmittedLink: false,
        
        get submissionCount() {
            return parseInt(localStorage.getItem('formSubmissionCount') || '0');
        },
        
        init() {
            const lastSubmitTime = localStorage.getItem('lastSubmitTime');
            if (lastSubmitTime && (Date.now() - parseInt(lastSubmitTime)) > 86400000) {
                localStorage.setItem('formSubmissionCount', '0');
            }
        },

        validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        containsLinks(text) {
            const linkPatterns = [
                /https?:\/\/[^\s]+/i,
                /www\.[^\s]+/i,
                /[^\s]+\.[a-z]{2,}/i
            ];
            return linkPatterns.some(pattern => pattern.test(text));
        },

        containsEmails(text) {
            const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            return emailPattern.test(text);
        },
        
        validateForm() {
            this.errors = {};
            
            if (this.submissionCount >= 5) {
                this.errors.general = 'Maximum daily submission limit reached. Please try again tomorrow.';
                return false;
            }

            if (this.hasSubmittedLink && this.attempts > 1) {
                this.errors.general = 'You have been temporarily blocked due to suspicious activity.';
                return false;
            }

            if (!this.form.firstName.trim()) {
                this.errors.firstName = 'First name is required';
            }
            
            if (!this.form.lastName.trim()) {
                this.errors.lastName = 'Last name is required';
            }
            
            if (!this.form.email.trim()) {
                this.errors.email = 'Email is required';
            } else if (!this.validateEmail(this.form.email)) {
                this.errors.email = 'Please enter a valid email address';
            }
            
            const message = this.form.message.trim();
            if (!message) {
                this.errors.message = 'Message is required';
            } else if (message.length < 10) {
                this.errors.message = 'Message must be at least 10 characters long';
            } else if (this.containsLinks(message)) {
                this.errors.message = 'Please do not include links in your message';
                this.hasSubmittedLink = true;
                this.attempts++;
                return false;
            } else if (this.containsEmails(message)) {
                this.errors.message = 'Please do not include email addresses in the message field';
            }
            
            return Object.keys(this.errors).length === 0;
        },
        
        async submitFormspree(event) {
            if (!this.validateForm()) {
                return;
            }
            
            this.loading = true;
            
            try {
                const currentCount = this.submissionCount;
                if (currentCount >= 5) {
                    throw new Error('Maximum daily submission limit reached');
                }

                const response = await fetch(event.target.action, {
                    method: 'POST',
                    body: new FormData(event.target),
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    localStorage.setItem('formSubmissionCount', (currentCount + 1).toString());
                    localStorage.setItem('lastSubmitTime', Date.now().toString());

                    this.formStatus = {
                        show: true,
                        success: true,
                        message: 'Thank you for your message! I will get back to you soon.'
                    };
                    this.resetForm();
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                this.formStatus = {
                    show: true,
                    success: false,
                    message: error.message || 'Sorry, there was an error sending your message. Please try again later.'
                };
            } finally {
                this.loading = false;
                this.$el.scrollIntoView({ behavior: 'smooth' });
            }
        },
        
        resetForm() {
            this.form = {
                firstName: '',
                lastName: '',
                email: '',
                subject: '',
                message: ''
            };
            this.errors = {};
        }
    };
}

// We can create a simple interactive DNA sequence viewer
function initDNAViewer() {
    const sequence = "ATCGATCG..."; // Example sequence
    const viewer = d3.select("#dna-viewer")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");
    
    // We'll implement the full visualization logic next
}

// Force-directed graph showing relationships between skills
function initSkillsNetwork() {
    const data = {
        nodes: [
            { id: "Python", group: 1 },
            { id: "Bioinformatics", group: 1 },
            { id: "Data Analysis", group: 2 },
            // More nodes...
        ],
        links: [
            { source: "Python", target: "Bioinformatics", value: 1 },
            { source: "Data Analysis", target: "Python", value: 2 },
            // More links...
        ]
    };
    // We'll implement the full D3.js force-directed graph next
}


// Timeline visualization showing project progression
function initProjectTimeline() {
    const projects = [
        { name: "GPTPortal", start: "2024-01", end: "2024-03" },
        { name: "Portfolio Website", start: "2024-02", end: "2024-04" },
        // More projects...
    ];
    // We'll implement the full timeline visualization next
}



// Language Proficiency Chart
document.addEventListener('alpine:init', () => {
    Alpine.data('languageChart', () => ({
        chart: null,
        init() {
            this.initChart();
            // Watch for dark mode changes
            this.$watch('$store.darkMode', () => {
                this.updateChartTheme();
            });
        },
        initChart() {
            const ctx = document.getElementById('languageChart');
            if (!ctx) return;

            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#e5e7eb' : '#374151';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

            this.chart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: [
                        'Python',
                        'JavaScript',
                        'R',
                        'Java',
                        'HTML/CSS',
                        'Node.js',
                        'Bioinformatics Tools',
                        'Data Analysis'
                    ],
                    datasets: [{
                        label: 'Current Proficiency',
                        data: [90, 95, 75, 60, 95, 90, 80, 85],
                        fill: true,
                        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        borderColor: isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
                        pointBackgroundColor: isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animations: {
                        tension: {
                            duration: 1000,
                            easing: 'linear',
                            from: 0.8,
                            to: 0.2,
                            loop: true
                        }
                    },
                    scales: {
                        r: {
                            angleLines: {
                                color: gridColor
                            },
                            grid: {
                                color: gridColor
                            },
                            pointLabels: {
                                color: textColor,
                                font: {
                                    size: 12,
                                    family: "'Inter', sans-serif"
                                }
                            },
                            ticks: {
                                color: textColor,
                                backdropColor: 'transparent',
                                font: {
                                    size: 10
                                },
                                // Add these settings to fix the scale
                                beginAtZero: true,
                                min: 0,
                                max: 100,
                                stepSize: 20,
                                showLabelBackdrop: false
                            },
                            // Add this to make the chart start from the center
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                            titleColor: isDark ? '#fff' : '#000',
                            bodyColor: isDark ? '#fff' : '#000',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return `Proficiency: ${context.raw}%`;
                                }
                            }
                        }
                    }
                }
            });
        },
        updateChartTheme() {
            if (!this.chart) return;
            
            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#e5e7eb' : '#374151';
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

            // Update colors
            this.chart.data.datasets[0].backgroundColor = isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)';
            this.chart.data.datasets[0].borderColor = isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)';
            this.chart.data.datasets[0].pointBackgroundColor = isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)';
            
            // Update scales
            this.chart.options.scales.r.angleLines.color = gridColor;
            this.chart.options.scales.r.grid.color = gridColor;
            this.chart.options.scales.r.pointLabels.color = textColor;
            this.chart.options.scales.r.ticks.color = textColor;

            // Update tooltip
            this.chart.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)';
            this.chart.options.plugins.tooltip.titleColor = isDark ? '#fff' : '#000';
            this.chart.options.plugins.tooltip.bodyColor = isDark ? '#fff' : '#000';
            this.chart.options.plugins.tooltip.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

            this.chart.update();
        }
    }));
});


// Skills Network Visualization
document.addEventListener('alpine:init', () => {
    Alpine.data('skillsNetwork', () => ({
        network: null,
        simulation: null,
        svg: null,
        width: 0,
        height: 0,

        init() {
            this.initNetwork();
            // Watch for dark mode changes
            this.$watch('$store.darkMode', () => {
                this.updateNetworkTheme();
            });
            // Watch for container resize
            window.addEventListener('resize', this.handleResize.bind(this));
        },

        handleResize() {
            const container = document.getElementById('skills-network');
            if (container) {
                this.width = container.clientWidth;
                this.height = container.clientHeight;
                this.updateNetworkSize();
            }
        },

        initNetwork() {
            const container = document.getElementById('skills-network');
            if (!container) return;

            this.width = container.clientWidth;
            this.height = container.clientHeight;

            // Clear any existing SVG
            d3.select('#skills-network svg').remove();

            // Create new SVG
            this.svg = d3.select('#skills-network')
                .append('svg')
                .attr('width', this.width)
                .attr('height', this.height);

            // Add zoom behavior
            const zoom = d3.zoom()
                .scaleExtent([0.5, 2])
                .on('zoom', (event) => {
                    this.svg.select('g').attr('transform', event.transform);
                });

            this.svg.call(zoom);

            // Create the network data
            const data = {
                nodes: [
                    // Core Skills
                    { id: "Bioinformatics", group: "core", size: 20 },
                    { id: "Programming", group: "core", size: 20 },
                    { id: "Medical", group: "core", size: 20 },
                    { id: "Research", group: "core", size: 20 },
                    
                    // Programming Skills
                    { id: "Python", group: "programming", size: 15 },
                    { id: "JavaScript", group: "programming", size: 15 },
                    { id: "R", group: "programming", size: 15 },
                    { id: "Java", group: "programming", size: 12 },
                    
                    // Biotech Skills
                    { id: "DNA Sequencing", group: "biotech", size: 12 },
                    { id: "Lab Techniques", group: "biotech", size: 12 },
                    { id: "PCR", group: "biotech", size: 10 },
                    { id: "Cell Culture", group: "biotech", size: 10 },
                    
                    // Medical Experience
                    { id: "Patient Care", group: "medical", size: 12 },
                    { id: "Clinical Operations", group: "medical", size: 12 },
                    { id: "Healthcare Protocols", group: "medical", size: 10 },
                    
                    // Tools
                    { id: "Git", group: "tools", size: 10 },
                    { id: "VS Code", group: "tools", size: 10 },
                    { id: "Obsidian.md", group: "tools", size: 10 },
                    { id: "Jupyter", group: "tools", size: 10 },
                    { id: "RStudio", group: "tools", size: 10 },
                    
                    // DevOps
                    { id: "Linux", group: "devops", size: 12 },
                    { id: "Docker", group: "devops", size: 12 },
                    { id: "Cloud Services", group: "devops", size: 12 }
                ],
                links: [
                    // Core connections
                    { source: "Bioinformatics", target: "Programming", value: 8 },
                    { source: "Bioinformatics", target: "Research", value: 8 },
                    { source: "Medical", target: "Research", value: 8 },
                    { source: "Programming", target: "Research", value: 8 },
                    
                    // Programming connections
                    { source: "Programming", target: "Python", value: 5 },
                    { source: "Programming", target: "JavaScript", value: 5 },
                    { source: "Programming", target: "R", value: 5 },
                    { source: "Programming", target: "Java", value: 4 },
                    
                    // Bioinformatics connections
                    { source: "Bioinformatics", target: "DNA Sequencing", value: 5 },
                    { source: "Bioinformatics", target: "Lab Techniques", value: 5 },
                    { source: "Lab Techniques", target: "PCR", value: 3 },
                    { source: "Lab Techniques", target: "Cell Culture", value: 3 },
                    
                    // Medical connections
                    { source: "Medical", target: "Patient Care", value: 5 },
                    { source: "Medical", target: "Clinical Operations", value: 5 },
                    { source: "Medical", target: "Healthcare Protocols", value: 4 },
                    
                    // Tool connections
                    { source: "Programming", target: "Git", value: 3 },
                    { source: "Programming", target: "VS Code", value: 3 },
                    { source: "Programming", target: "Obsidian.md", value: 3 },
                    { source: "Programming", target: "Jupyter", value: 3 },
                    { source: "Programming", target: "RStudio", value: 3 },
                    
                    // DevOps connections
                    { source: "Programming", target: "Linux", value: 4 },
                    { source: "Programming", target: "Docker", value: 4 },
                    { source: "Programming", target: "Cloud Services", value: 4 }
                ]
            };

            // Color scale for different groups
            const color = d3.scaleOrdinal()
                .domain(["core", "programming", "biotech", "medical", "tools", "devops"])
                .range(["#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B", "#6366F1"]);

            // Create force simulation
            // Adjust these values in the simulation setup
            // Adjust the center force to be slightly left of center
            this.simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links)
                .id(d => d.id)
                .distance(d => 125 - d.value * 3))
            .force("charge", d3.forceManyBody()
                .strength(-300)
                .distanceMax(300))
            // Move the center point slightly left
            .force("center", d3.forceCenter(this.width * 0.45, this.height / 2)) // Changed from width/2 to width * 0.45
            .force("collision", d3.forceCollide().radius(d => d.size * 2.5))
            // Adjust boundary forces to maintain the leftward shift
            .force("x", d3.forceX(this.width * 0.45).strength(0.05)) // Also adjusted to match
            .force("y", d3.forceY(this.height / 2).strength(0.05));

            // Create container group
            const g = this.svg.append("g");

            // Create links
            const links = g.append("g")
                .selectAll("line")
                .data(data.links)
                .join("line")
                .attr("stroke-width", d => Math.sqrt(d.value))
                .attr("stroke", "rgba(156, 163, 175, 0.6)");

            // Create nodes
            const nodes = g.append("g")
                .selectAll("g")
                .data(data.nodes)
                .join("g")
                .call(d3.drag()
                    .on("start", this.dragstarted.bind(this))
                    .on("drag", this.dragged.bind(this))
                    .on("end", this.dragended.bind(this)));

            // Add circles to nodes
            nodes.append("circle")
                .attr("r", d => d.size)
                .attr("fill", d => color(d.group))
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);

            // Add labels to nodes
            nodes.append("text")
            .text(d => d.id)
            .attr("x", d => d.size + 8) // Increased offset from node
            .attr("y", 4)
            .attr("font-size", "13px") // Slightly larger font
            .attr("font-weight", d => d.group === "core" ? "600" : "400") // Bold for core skills
            .attr("fill", this.isDarkMode() ? "#e5e7eb" : "#374151");

            // Update positions on tick
            this.simulation.on("tick", () => {
                links
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                nodes
                    .attr("transform", d => `translate(${d.x},${d.y})`);
            });

            // Store references
            this.network = { nodes, links };
        },

        isDarkMode() {
            return document.documentElement.classList.contains('dark');
        },

        updateNetworkTheme() {
            if (!this.network) return;
            
            const textColor = this.isDarkMode() ? "#e5e7eb" : "#374151";
            this.network.nodes.selectAll("text")
                .attr("fill", textColor);
        },

        updateNetworkSize() {
            if (!this.svg || !this.simulation) return;
            
            this.svg
                .attr("width", this.width)
                .attr("height", this.height);
                
            this.simulation
                .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                .restart();
        },

        dragstarted(event, d) {
            if (!event.active) this.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        },

        dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        },

        dragended(event, d) {
            if (!event.active) this.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }));
});

// Project Timeline Visualization
document.addEventListener('alpine:init', () => {
    Alpine.data('projectTimeline', () => ({
        chart: null,
        zoom: null,
        tooltipData: {
            name: '',
            description: '',
            completion: 0,
            dates: '',
            category: ''
        },
        resizeObserver: null,

        init() {
            this.initChart();
            
            this.resizeObserver = new ResizeObserver(entries => {
                this.initChart();
            });
            this.resizeObserver.observe(this.$el);
            
            this.$watch('$store.darkMode', () => {
                this.updateChartTheme();
            });
        },

        destroyed() {
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
        },

        initChart() {
            const projects = [
                {
                    id: "website1",
                    name: "First Brand Website",
                    startDate: "2023-01",
                    endDate: "2023-06",
                    completion: 100,
                    category: "Web\nDevelopment",
                    description: "Initial personal brand website developed in 11th grade using basic HTML/CSS."
                },
                {
                    id: "website2",
                    name: "Second Brand Website",
                    startDate: "2023-09",
                    endDate: "2024-03",
                    completion: 100,
                    category: "Web\nDevelopment",
                    description: "Enhanced personal brand website with improved design and functionality developed in 12th grade."
                },
                {
                    id: "portfolio",
                    name: "Portfolio Website",
                    startDate: "2024-12",
                    endDate: "2025-02",
                    completion: 100,
                    category: "Web\nDevelopment",
                    description: "Professional portfolio website built with modern technologies including Tailwind CSS and Alpine.js."
                },
                {
                    id: "gptportal",
                    name: "GPTPortal",
                    startDate: "2023-06",
                    endDate: "2024-01",
                    completion: 90,
                    category: "AI/ML",
                    description: "Advanced LLM interface integrating multiple AI providers with sophisticated features."
                },
                {
                    id: "epigenai",
                    name: "EpiGenAI Portal",
                    startDate: "2023-08",
                    endDate: "2024-01",
                    completion: 80,
                    category: "Bioinformatics",
                    description: "Specialized portal for epigenetic data analysis using vector embeddings."
                },
                {
                    id: "bild4",
                    name: "BILD4 Research",
                    startDate: "2024-09",
                    endDate: "2024-12",
                    completion: 100,
                    category: "Research",
                    description: "Comprehensive research on epigenetic effects of alcohol consumption."
                },
                {
                    id: "genomic",
                    name: "Genomic Analysis Tool",
                    startDate: "2024-12",
                    endDate: "2025-01",
                    completion: 70,
                    category: "Bioinformatics",
                    description: "Python-based tool for processing and visualizing DNA sequence data."
                },
                {
                    id: "rviz",
                    name: "R Visualization",
                    startDate: "2024-12",
                    endDate: "2025-02",
                    completion: 60,
                    category: "Data Analysis",
                    description: "R-based visualization toolkit for biological research data."
                }
            ];

            const container = document.getElementById('project-timeline');
            if (!container) return;

            container.innerHTML = '';

            const margin = { top: 30, right: 60, bottom: 60, left: 160 };
            const width = container.clientWidth - margin.left - margin.right;
            const height = container.clientHeight - margin.top - margin.bottom;

            const svg = d3.select(container)
                .append('svg')
                .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
                .attr('width', '100%')
                .attr('height', '100%');

            this.zoom = d3.zoom()
                .scaleExtent([0.5, 2])
                .on('zoom', (event) => {
                    mainGroup.attr('transform', event.transform);
                });

            svg.call(this.zoom);

            const mainGroup = svg.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const initialTransform = d3.zoomIdentity
                .translate(margin.left, margin.top)
                .scale(0.95);
            svg.call(this.zoom.transform, initialTransform);

            const timeScale = d3.scaleTime()
                .domain([new Date('2023-01'), new Date('2025-03')])
                .range([0, width]);

            const categories = ['Web\nDevelopment', 'AI/ML', 'Bioinformatics', 'Research', 'Data Analysis'];
            const categoryScale = d3.scaleBand()
                .domain(categories)
                .range([0, height])
                .padding(0.4);

            mainGroup.selectAll('.category-bg')
                .data(categories)
                .join('rect')
                .attr('class', 'category-bg')
                .attr('x', -margin.left)
                .attr('y', d => categoryScale(d))
                .attr('width', width + margin.left + margin.right)
                .attr('height', categoryScale.bandwidth())
                .attr('fill', this.isDarkMode() ? '#1F2937' : '#F3F4F6')
                .attr('rx', 6);

            mainGroup.selectAll('.category-label')
                .data(categories)
                .join('text')
                .attr('class', 'category-label')
                .attr('x', -margin.left + 10)
                .attr('y', d => categoryScale(d) + categoryScale.bandwidth() / 2 - 10)
                .attr('fill', this.isDarkMode() ? '#E5E7EB' : '#374151')
                .attr('dominant-baseline', 'middle')
                .style('font-size', '14px')
                .style('font-weight', '500')
                .each(function(d) {
                    const words = d.split('\n');
                    d3.select(this)
                        .selectAll('tspan')
                        .data(words)
                        .join('tspan')
                        .attr('x', -margin.left + 10)
                        .attr('dy', (_, i) => i === 0 ? 0 : '1.1em')
                        .text(d => d)
                        .style('font-size', '14px');
                });

            const projectGroups = mainGroup.selectAll('.project')
                .data(projects)
                .join('g')
                .attr('class', 'project')
                .attr('transform', d => `translate(${timeScale(new Date(d.startDate))},${categoryScale(d.category)})`);

            projectGroups.append('rect')
                .attr('class', 'project-rect')
                .attr('width', d => Math.max(
                    timeScale(new Date(d.endDate)) - timeScale(new Date(d.startDate)),
                    100
                ))
                .attr('height', categoryScale.bandwidth() * 0.8)
                .attr('y', categoryScale.bandwidth() * 0.1)
                .attr('rx', 6)
                .attr('fill', d => this.getProjectColor(d.category, d.completion))
                .attr('opacity', 0.9)
                .style('cursor', 'pointer')
                .on('mouseenter', (event, d) => {
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .attr('opacity', 1)
                        .style('filter', 'brightness(1.2)');
                    this.showTooltip(event, d);
                })
                .on('mousemove', (event, d) => {
                    this.updateTooltipPosition(event);
                })
                .on('mouseleave', (event) => {
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .attr('opacity', 0.9)
                        .style('filter', null);
                    this.hideTooltip();
                });

            projectGroups.append('text')
                .attr('x', 10)
                .attr('y', categoryScale.bandwidth() / 2)
                .attr('fill', 'white')
                .attr('dominant-baseline', 'middle')
                .style('font-size', '14px')
                .style('font-weight', '500')
                .style('pointer-events', 'none')
                .text(d => d.name);

            projectGroups.append('rect')
                .attr('class', 'completion-bar')
                .attr('x', 0)
                .attr('y', categoryScale.bandwidth() * 0.9 - 4)
                .attr('width', d => {
                    const width = timeScale(new Date(d.endDate)) - timeScale(new Date(d.startDate));
                    return Math.max(width * (d.completion / 100), 0);
                })
                .attr('height', 4)
                .attr('fill', 'white')
                .attr('opacity', 0.6);

            const timeAxis = d3.axisBottom(timeScale)
                .ticks(d3.timeMonth.every(2))
                .tickFormat(d3.timeFormat('%b %Y'));

            mainGroup.append('g')
                .attr('transform', `translate(0,${height + 10})`)
                .call(timeAxis)
                .selectAll('text')
                .attr('fill', this.isDarkMode() ? '#E5E7EB' : '#374151')
                .style('font-size', '12px')
                .attr('transform', 'rotate(-45)')
                .attr('dx', '-0.5em')
                .attr('dy', '0.5em')
                .style('text-anchor', 'end');
        },

        getProjectColor(category, completion) {
            const colors = {
                'Web\nDevelopment': '#3B82F6',
                'AI/ML': '#10B981',
                'Bioinformatics': '#8B5CF6',
                'Research': '#EF4444',
                'Data Analysis': '#F59E0B'
            };
            const baseColor = d3.rgb(colors[category.split('\n')[0]] || '#6B7280');
            return baseColor.darker(1 - completion / 100);
        },

        showTooltip(event, data) {
            const tooltip = this.$refs.tooltip;
            if (!tooltip) return;

            this.tooltipData = {
                name: data.name,
                description: data.description,
                completion: data.completion,
                dates: `${data.startDate} - ${data.endDate}`,
                category: data.category.replace('\n', ' ')
            };

            this.updateTooltipPosition(event);
            tooltip.classList.remove('hidden');
        },

        updateTooltipPosition(event) {
            const tooltip = this.$refs.tooltip;
            if (!tooltip) return;

            const container = this.$el.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left = event.clientX - container.left;
            let top = event.clientY - container.top + 20;

            if (left + tooltipRect.width > container.width) {
                left = container.width - tooltipRect.width - 10;
            }
            if (left < 0) {
                left = 10;
            }
            if (top + tooltipRect.height > container.height) {
                top = event.clientY - container.top - tooltipRect.height - 10;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        },

        hideTooltip() {
            const tooltip = this.$refs.tooltip;
            if (tooltip) {
                tooltip.classList.add('hidden');
            }
        },

        isDarkMode() {
            return document.documentElement.classList.contains('dark');
        },

        updateChartTheme() {
            this.initChart();
        }
    }));
});