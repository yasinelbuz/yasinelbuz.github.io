document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll for items that are not initially in viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial styles for animations are set inside CSS (fade-in).
    // For specific elements like cards that might appear on scroll
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`;
        observer.observe(card);
    });

    const blogItems = document.querySelectorAll('.blog-item');
    blogItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        item.style.transition = `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`;
        observer.observe(item);
    });
});
