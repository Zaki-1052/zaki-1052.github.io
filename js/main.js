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
