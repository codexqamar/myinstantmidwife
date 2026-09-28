/* ============================================================
   COMPONENTS.JS - Reusable Header & Footer Components
   ============================================================
   This file injects the shared header (navbar) and footer
   into every page via placeholder divs:
     - #header-placeholder  -> Navbar
     - #footer-placeholder  -> "Have any questions?" + Footer
   ============================================================ */

(function () {
    "use strict";

    /* ----------------------------------------------------------
       HELPER: Detect the current page from the URL so we can
       highlight the active nav link.
    ---------------------------------------------------------- */
    function getCurrentPage() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes("about")) return "about";
        if (path.includes("courses")) return "courses";
        if (path.includes("testimonials")) return "testimonials";
        if (path.includes("faq")) return "faq";
        if (path.includes("contact")) return "contact";
        if (path.includes("subscription")) return "subscription";
        return "home";
    }

    const activePage = getCurrentPage();

    /* ----------------------------------------------------------
       HEADER / NAVBAR
       - Fixed white bar with MIM logo, navigation links,
         and a "BOOK NOW" CTA button.
       - On mobile a hamburger menu icon is shown.
    ---------------------------------------------------------- */
    const headerHTML = `
    <nav class="navbar">
        <!-- Logo -->
        <a href="/" class="logo">
            <img src="/images/Group.png" alt="My Instant Midwife Logo">
        </a>

        <!-- Desktop Navigation Links -->
        <ul class="nav-links">
            <li><a href="/" class="${activePage === 'home' ? 'active' : ''}">HOME</a></li>
            <li><a href="/about" class="${activePage === 'about' ? 'active' : ''}">WHO I AM</a></li>
            <li><a href="/courses" class="${activePage === 'courses' ? 'active' : ''}">COURSES</a></li>
            <li><a href="/faq" class="${activePage === 'faq' ? 'active' : ''}">FAQ'S</a></li>
            <li><a href="/contact" class="${activePage === 'contact' ? 'active' : ''}">CONTACT ME</a></li>
            <li><a href="/subscription" class="${activePage === 'subscription' ? 'active' : ''}">SUBSCRIPTION</a></li>
            <li class="nav-mobile-cta"><a href="https://calendly.com/wson-tasmin/60" class="book-now-btn" target="_blank" rel="noopener noreferrer">Schedule a Call <i class="fas fa-arrow-right diag-icon"></i></a></li>
            <li class="nav-mobile-cta"><a href="/subscription" class="book-now-btn">BOOK NOW <i class="fas fa-arrow-right diag-icon"></i></a></li>
        </ul>

        <!-- Search & Book Now CTA -->
        <div style="display: flex; align-items: center; gap: 20px;">
            <a href="#" style="color: var(--text-dark); font-size: 18px;"></a>
            <a href="https://calendly.com/wson-tasmin/60" class="book-now-btn" target="_blank" rel="noopener noreferrer">Schedule a Call <i class="fas fa-arrow-right diag-icon"></i></a>
            <a href="/subscription" class="book-now-btn">BOOK NOW <i class="fas fa-arrow-right diag-icon"></i></a>
        </div>

        <!-- Mobile Hamburger Button (hidden on desktop) -->
        <button class="mobile-menu-btn" aria-label="Toggle menu">
            <span class="hamburger-icon" aria-hidden="true"></span>
        </button>
    </nav>
    `;

    /* ----------------------------------------------------------
       FOOTER
       Composed of three visual blocks:
       1. "Have any questions?" call-to-action strip
       2. Gallery image strip (4 thumbnails)
       3. Main footer columns (logo, quick links, contact, social)
       4. Copyright bar
    ---------------------------------------------------------- */
    const footerHTML = `
    <!-- ====== Have Any Questions? CTA Section ====== -->
    <section class="questions-cta">
        <div class="questions-content">
            <div class="questions-text">
                <h3>Have any questions?</h3>
                <p>Get in touch to find our more about our services and how we can support you</p>
            </div>
            <a href="/contact" class="btn-beige">CONTACT me <i class="fas fa-arrow-right diag-icon"></i></a>
        </div>
    </section>

    

    <div class="gallery">
        <div class="gallery-track">
            <div class="gallery-item"><img src="/images/family.jpeg" alt="Family"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/whoiam.jpeg" alt="Midwife portrait"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/offer1.png" alt="Support package"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/offer2.png" alt="Support package"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/offer3.png" alt="Support package"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/pkg.png" alt="Support package"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/signature-support.jpeg" alt="Support package"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/course1.png" alt="Course"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/course2.png" alt="Course"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/course3.png" alt="Course"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/testimonial1.png" alt="Client"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/testimonial8.jpeg" alt="Client"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.53 PM.jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.54 PM (1).jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.54 PM.JPG" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.55 PM (1).jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.55 PM.jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.56 PM (1).jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.56 PM.jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.57 PM.jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.58 PM.jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.59 PM (1).jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.27.59 PM.jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
            <div class="gallery-item"><img src="/images/WhatsApp Image 2026-06-16 at 9.28.00 PM.jpeg" alt="Gallery image"><div class="ig-overlay"><i class="fab fa-instagram"></i></div></div>
        </div>
    </div>

    <!-- ====== Main Footer ====== -->
    <footer class="contact-footer">
        <div class="footer-columns">
            <!-- Column 1: Logo & Description -->
            <div class="footer-logo-area">
                <a href="/" class="logo">
                    <img src="/images/logo-white.png" alt="My Instant Midwife Logo">
                </a>
                <p>The journey to parenthood is one of the most significant of your life. You deserve support that meets you where you are, informed, consistent, and genuinely personal. With MIM, expert midwifery care is never more than a message away.</p>
                <p>Ready to get started? Explore our subscription packages and find the right level of support for your journey.</p>
            </div>

            <div class="quick-links">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">Who I Am</a></li>
                    <li><a href="/courses">Courses</a></li>
                    <li><a href="/faq">FAQ's</a></li>
                    <li><a href="/subscription">Subscription</a></li>
                    <li><a href="/contact">Contact Me</a></li>
                    
                </ul>
            </div>

          
                <div class="contact-info">  
                 
                 
                </div>
                <div class="follow">
                    <h4>Follow Us</h4>
                    <div class="social-icons">
                        <a href="https://www.facebook.com/share/g/1GVNyi4eY6/" class="social-circle" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/mim_myinstantmidwife?igsh=MW0wN25hdjE2aXYxZw==" class="social-circle" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Copyright Bar -->
        <div class="copyright">
            <span>Copyright &copy; 2026. My Instant Midwife. All rights reserved.</span>
            <div class="copyright-links">
              <a href="/privacy-policy">Privacy Policy</a> &nbsp;|&nbsp;  <a href="/terms-conditions">Terms & Conditions</a>
            </div>
        </div>
    </footer>
    `;

    /* ----------------------------------------------------------
       INJECT: Insert header & footer HTML into their
       respective placeholder elements on DOM ready.
    ---------------------------------------------------------- */
    function injectComponents() {
        const headerEl = document.getElementById("header-placeholder");
        const footerEl = document.getElementById("footer-placeholder");

        if (headerEl) headerEl.innerHTML = headerHTML;
        if (footerEl) footerEl.innerHTML = footerHTML;
    }

    /* Run when DOM is ready */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectComponents);
    } else {
        injectComponents();
    }

})();
