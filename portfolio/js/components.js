/**
 * Alpine.js Component Definitions
 * All interactive components for the portfolio
 */

// Page transitions and loading
document.addEventListener('alpine:init', () => {
    // Page transitions
    Alpine.data('pageTransitions', () => ({
        init() {
            this.animateOnScroll();
        },
        animateOnScroll() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('section').forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                section.style.transition = 'all 0.5s ease-in-out';
                observer.observe(section);
            });
        }
    }));

    // Scroll progress bar
    Alpine.data('scrollProgress', () => ({
        percentage: 0,
        init() {
            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                this.percentage = (winScroll / height) * 100;
            });
        }
    }));

    // Navigation
    Alpine.data('navigation', () => ({
        isOpen: false,
        isDark: false,
        init() {
            this.isDark = document.documentElement.classList.contains('dark');
        },
        toggleMenu() {
            this.isOpen = !this.isOpen;
        },
        toggleDark() {
            this.isDark = !this.isDark;
            if (this.isDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'false');
            }
        }
    }));

    // Reading time calculator
    Alpine.data('calculateReadingTime', () => ({
        readingTime: 0,
        init() {
            const text = document.body.innerText;
            const wordsPerMinute = 200;
            const wordCount = text.trim().split(/\s+/).length;
            this.readingTime = Math.ceil(wordCount / wordsPerMinute);
        }
    }));

    // Contact form
    Alpine.data('contactForm', () => ({
        isSubmitting: false,
        showSuccess: false,
        showError: false,
        errorMessage: '',
        formData: {
            firstName: '',
            lastName: '',
            email: '',
            subject: '',
            message: ''
        },
        async submitForm() {
            if (!this.validateForm()) return;

            this.isSubmitting = true;
            this.showSuccess = false;
            this.showError = false;

            try {
                const response = await fetch('https://formspree.io/f/xzzblaeb', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.formData)
                });

                if (response.ok) {
                    this.showSuccess = true;
                    this.resetForm();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                this.showError = true;
                this.errorMessage = 'Failed to send message. Please try again.';
            } finally {
                this.isSubmitting = false;
            }
        },
        validateForm() {
            if (!this.formData.firstName || !this.formData.lastName ||
                !this.formData.email || !this.formData.message) {
                this.showError = true;
                this.errorMessage = 'Please fill in all required fields.';
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.formData.email)) {
                this.showError = true;
                this.errorMessage = 'Please enter a valid email address.';
                return false;
            }

            return true;
        },
        resetForm() {
            this.formData = {
                firstName: '',
                lastName: '',
                email: '',
                subject: '',
                message: ''
            };
        }
    }));

    // Clipboard functionality
    Alpine.data('clipboard', () => ({
        copied: false,
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 2000);
            });
        }
    }));

    // Skills Network Visualization
    Alpine.data('skillsNetwork', () => ({
        init() {
            this.createSkillsNetwork();
        },
        createSkillsNetwork() {
            const container = document.getElementById('skills-network');
            if (!container) return;

            const width = container.clientWidth;
            const height = 400;

            const skills = [
                { name: 'Python', level: 90, category: 'programming' },
                { name: 'JavaScript', level: 95, category: 'programming' },
                { name: 'R', level: 75, category: 'programming' },
                { name: 'Genomics', level: 70, category: 'biology' },
                { name: 'Machine Learning', level: 65, category: 'ai' },
                { name: 'Web Dev', level: 90, category: 'programming' },
                { name: 'Bioinformatics', level: 80, category: 'biology' },
                { name: 'Data Analysis', level: 85, category: 'analysis' }
            ];

            const svg = d3.select(container)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            const simulation = d3.forceSimulation(skills)
                .force('charge', d3.forceManyBody().strength(-100))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collision', d3.forceCollide().radius(d => d.level / 2 + 10));

            const nodes = svg.selectAll('circle')
                .data(skills)
                .enter()
                .append('circle')
                .attr('r', d => d.level / 2)
                .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
                .attr('opacity', 0.7);

            const labels = svg.selectAll('text')
                .data(skills)
                .enter()
                .append('text')
                .text(d => d.name)
                .attr('font-size', '12px')
                .attr('text-anchor', 'middle')
                .attr('dy', '.35em');

            simulation.on('tick', () => {
                nodes
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);

                labels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y);
            });
        }
    }));

    // Language Proficiency Chart
    Alpine.data('languageChart', () => ({
        init() {
            this.createLanguageChart();
        },
        createLanguageChart() {
            const ctx = document.getElementById('languageChart');
            if (!ctx) return;

            const skills = window.portfolioData?.skills?.programming || [
                { name: 'Python', proficiency: 90 },
                { name: 'JavaScript', proficiency: 95 },
                { name: 'R', proficiency: 75 },
                { name: 'Java', proficiency: 40 },
                { name: 'Rust', proficiency: 40 },
                { name: 'TypeScript', proficiency: 45 }
            ];

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: skills.map(s => s.name),
                    datasets: [{
                        label: 'Proficiency',
                        data: skills.map(s => s.proficiency),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }));

    // DNA Viewer
    Alpine.data('dnaViewer', () => ({
        sequence: 'ATCGATCGATCGATCGATCGATCG',
        searchTerm: '',
        showComplement: false,
        init() {
            this.generateRandomDNA();
        },
        generateRandomDNA() {
            const bases = ['A', 'T', 'C', 'G'];
            let sequence = '';
            for (let i = 0; i < 100; i++) {
                sequence += bases[Math.floor(Math.random() * 4)];
            }
            this.sequence = sequence;
        },
        get complement() {
            const complementMap = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' };
            return this.sequence.split('').map(base => complementMap[base]).join('');
        },
        get displaySequence() {
            return this.showComplement ? this.complement : this.sequence;
        },
        highlightPattern() {
            if (!this.searchTerm) return this.displaySequence;
            const regex = new RegExp(this.searchTerm, 'gi');
            return this.displaySequence.replace(regex, match => `<mark class="bg-yellow-300 dark:bg-yellow-600">${match}</mark>`);
        }
    }));

    // Project Timeline
    Alpine.data('projectTimeline', () => ({
        init() {
            this.createTimeline();
        },
        createTimeline() {
            const container = document.getElementById('project-timeline');
            if (!container) return;

            const projects = window.portfolioData?.projects?.github || [];
            const width = container.clientWidth;
            const height = 500;

            const svg = d3.select(container)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            // Simple timeline visualization
            const timelineData = projects.slice(0, 10).map((project, i) => ({
                name: project.title,
                progress: project.progress || Math.random() * 100,
                y: i * 45 + 30
            }));

            const xScale = d3.scaleLinear()
                .domain([0, 100])
                .range([50, width - 50]);

            timelineData.forEach(d => {
                // Background bar
                svg.append('rect')
                    .attr('x', 50)
                    .attr('y', d.y)
                    .attr('width', width - 100)
                    .attr('height', 20)
                    .attr('fill', '#e5e7eb')
                    .attr('rx', 4);

                // Progress bar
                svg.append('rect')
                    .attr('x', 50)
                    .attr('y', d.y)
                    .attr('width', (width - 100) * (d.progress / 100))
                    .attr('height', 20)
                    .attr('fill', '#3b82f6')
                    .attr('rx', 4);

                // Label
                svg.append('text')
                    .attr('x', 50)
                    .attr('y', d.y - 5)
                    .text(d.name)
                    .attr('font-size', '12px')
                    .attr('fill', '#374151');
            });
        }
    }));
});
