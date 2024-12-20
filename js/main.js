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