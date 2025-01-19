// Analytics service
(function () {
    const domain = window.location.origin;
    const analyticsBase = `${domain}/api/analytics`;
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);

    function sendAnalytics(endpoint, data) {
        fetch(`${analyticsBase}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                url: window.location.href,
                timestamp: Date.now(),
            }),
        }).catch(console.error);
    }

    // Track page views
    window.addEventListener('load', () => {
        sendAnalytics('page-view', {});
    });

    // Track clicks
    document.addEventListener('click', (e) => {
        sendAnalytics('click-event', {
            element: e.target.tagName,
            elementId: e.target.id || null,
            elementClass: e.target.className || null,
            positionX: e.clientX,
            positionY: e.clientY,
        });
    });

    // Track session duration
    let sessionStart = Date.now();
    window.addEventListener('beforeunload', () => {
        const duration = Date.now() - sessionStart;
        sendAnalytics('session', {
            sessionId: sessionId,
            duration: duration,
        });
    });

    // Expose custom event tracking globally
    window.trackCustomEvent = function(eventName, data = {}) {
        sendAnalytics('custom-event', {
            eventName: eventName,
            data: data,
        });
    };
})();