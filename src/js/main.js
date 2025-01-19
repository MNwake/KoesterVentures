document.addEventListener('DOMContentLoaded', () => {
    // Analytics tracking
    class AnalyticsTracker {
        constructor() {
            this.baseUrl = '/api/analytics';
            this.sessionId = this.generateSessionId();
            this.trackPageView();
            this.setupClickTracking();
            this.setupExitLinkTracking();
            this.setupHeartbeat();
            this.setupPageExit();
        }
    
        generateSessionId() {
            const cookieName = 'session_id';
            const existingCookie = document.cookie.split('; ').find(row => row.startsWith(`${cookieName}=`));
            let sessionId = existingCookie ? existingCookie.split('=')[1] : null;
        
            if (!sessionId) {
                sessionId = `${Date.now()}-${crypto.randomUUID()}`;
                document.cookie = `${cookieName}=${sessionId}; path=/; domain=.koesterventures.com; secure`;
            }
            return sessionId;
        }
        
        

        async sendAnalyticsEvent(endpoint, data) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Host': window.location.hostname // Include base URL in headers
                    },
                    body: JSON.stringify({
                        ...data,
                        session_id: this.sessionId, // Ensure session_id is always included
                        timestamp: Math.floor(Date.now() / 1000),
                    }),
                });
                if (!response.ok) throw new Error('Analytics request failed');
            } catch (error) {
                console.error('Analytics error:', error);
            }
        }
        
        
    
        trackPageView() {
            this.sendAnalyticsEvent('/page-view', {
                url: window.location.href,
                referrer: document.referrer || 'direct',
            });
        }
    
        setupClickTracking() {
            document.addEventListener('click', (e) => {
                const element = e.target;
                this.sendAnalyticsEvent('/click-event', {
                    element_tag: element.tagName.toLowerCase(),
                    element_id: element.id || null,
                    element_classes: element.className || null,
                    element_text: element.textContent.trim().slice(0, 50), // Limit text length
                    position_x: e.pageX,
                    position_y: e.pageY
                });
            });
        }
    
        setupExitLinkTracking() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (!link) return;
    
                const href = link.href;
                if (href && !href.includes(window.location.hostname)) {
                    this.sendAnalyticsEvent('/exit-link', {
                        current_url: window.location.href,
                        exit_url: href,
                    });
                }
            });
        }
    
        trackCustomEvent(eventName, data = {}) {
            this.sendAnalyticsEvent('/custom-event', {
                event_name: eventName,
                data,
            });
        }
    
        setupHeartbeat() {
            let isUserActive = false;
        
            const markActive = () => {
                isUserActive = true;
            };
        
            document.addEventListener('mousemove', markActive);
            document.addEventListener('keydown', markActive);
        
            setInterval(() => {
                if (isUserActive) {
                    this.sendAnalyticsEvent('/session/heartbeat', {});
                    isUserActive = false; // Reset activity flag
                }
            }, 15000);
        }
        
    
        setupPageExit() {
            window.addEventListener('beforeunload', () => {
                const data = {
                    current_url: window.location.href,
                    exit_url: document.referrer,
                    session_id: this.sessionId,
                    timestamp: Math.floor(Date.now() / 1000),
                };
        
                navigator.sendBeacon(`${this.baseUrl}/exit-link`, JSON.stringify(data));
            });
        }
        
    }

    // Initialize analytics
    const analytics = new AnalyticsTracker();

    // Make analytics available globally
    window.trackCustomEvent = (eventName, data) => {
        analytics.trackCustomEvent(eventName, data);
    };

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: e.target.querySelector('input[name="name"]').value,
                email: e.target.querySelector('input[name="email"]').value,
                message: e.target.querySelector('textarea[name="message"]').value
            };

            // Track form submission
            analytics.trackCustomEvent('form_submission', {
                form_id: 'contactForm',
                form_type: 'contact'
            });

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error('Form submission failed');

                // Clear form
                e.target.reset();
                
                // Show success message
                alert('Thank you for your message. We will get back to you soon!');
                
                analytics.trackCustomEvent('form_submission_success', {
                    form_id: 'contactForm'
                });
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Sorry, there was an error submitting your message. Please try again.');
                
                analytics.trackCustomEvent('form_submission_error', {
                    form_id: 'contactForm',
                    error: error.message
                });
            }
        });
    }

    // Portfolio project tracking
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            analytics.trackCustomEvent('portfolio_view', {
                project_id: item.dataset.projectId,
                project_name: item.dataset.projectName
            });
        });
    });

    // Newsletter signup tracking
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            analytics.trackCustomEvent('newsletter_signup', {
                form_id: 'newsletterForm'
            });

            // Add your newsletter signup logic here
        });
    }

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY + window.innerHeight) / 
            document.documentElement.scrollHeight * 100);
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                analytics.trackCustomEvent('scroll_depth', {
                    depth: maxScroll
                });
            }
        }
    });

    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        analytics.trackCustomEvent('time_on_page', {
            seconds: timeSpent
        });
    });
}); 