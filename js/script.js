/* ============================================================
   SCRIPT.JS - My Instant Midwife - Main JavaScript
   ============================================================
   Table of Contents:
   1. Testimonial Slider (data + rotation)
   2. Smooth Scroll for Anchor Links
   3. Button Hover Animations
   4. Scroll-triggered Fade-in Animations
   5. Mobile Menu Toggle
   6. Gallery Drag-to-Scroll
   7. FAQ Accordion
   ============================================================ */


/* ==========================================================
   1. TESTIMONIAL SLIDER
   Rotates through client quotes with fade animation.
   Controlled by dot pagination and auto-advances every 7s.
   ========================================================== */

const testimonialsArr = [
    {
        text: "\u201CAs first-time parents, we weren't sure what to expect from a biomechanics class, but it genuinely exceeded all expectations. Understanding how positioning and movement could influence labour felt like being given information we didn't even know we were missing. The class gave us real confidence going into birth and we can honestly say it made a difference. We can't recommend it highly enough.\u201D",
        name: "Beth & Nathan",
        location: "Biomechanics in Labour Course"
    },
    {
        text: "\u201COur labour was incredibly fast, which we didn't anticipate — but looking back, I truly believe that understanding what was happening to my body made all the difference. The course gave me a level of awareness that kept me calm and in control even when things moved quickly. Honestly, it was the knowledge more than anything else that carried me through.\u201D",
        name: "India & Jack",
        location: "Biomechanics in Labour Course"
    },
    {
        text: "\u201CI absolutely love my visits and would recommend Tasmin to anybody without hesitation. I've had pregnancy massages and more recently the post-dates treatment she offers, and every single session has been wonderful. What makes it so special is that alongside the treatments, Tasmin takes the time to talk things through — I always leave feeling so much more confident, informed, and of course completely chilled out. I can't recommend her enough.\u201D",
        name: "Megan",
        location: "Pregnancy Massage & Post-Dates Treatment"
    },
    {
        text: "\u201CMy postnatal massage with Tasmin was such a wonderful experience. My breastfeeding baby was a little fussy during the session, but Tasmin was incredibly understanding — she patiently helped me settle my little one while making sure I still had time to properly relax and enjoy the treatment. Her soothing touch and genuine attention to how I was feeling left me completely at ease, both physically and mentally. I'd highly recommend Tasmin to any new mum looking for truly supportive postnatal care.\u201D",
        name: "Melissa",
        location: "Postnatal Massage"
    },
    {
        text: "\u201CI've been meaning to write this review since finishing our hypnobirthing course with Tasmin — but in the meantime I've had my gorgeous little boy, and I can honestly say that hypnobirthing truly worked for us. To cut a short labour story even shorter, I dilated fully at home and used every technique Tasmin had taught us to get through it. I barely remember pain — just the music, the breathing, and focusing through the pressure. All down to Tasmin. And then, as if it was meant to be, when I arrived at the hospital — Tasmin was on duty. Her calm presence, her techniques, and her ability to refocus me when I went slightly off track meant more to me than I will ever be able to put into words. I couldn't recommend her highly enough.\u201D",
        name: "Lynsay",
        location: "Hypnobirthing Course"
    },
    {
        text: "\u201CMiM was the perfect support throughout our pregnancy journey. Due to a pre-existing medical condition, a caesarean section was the safest option for us — and while we knew it was the right decision, it naturally brought its own anxieties for both myself and my husband. Tasmin tailored our hypnobirthing sessions entirely to our individual needs, addressing our fears around the antenatal period, the birth itself, and recovery. Over five sessions she guided us through techniques that genuinely transformed how we felt going into theatre — she even suggested we choose our own music, which made the experience feel personal and calm rather than clinical. Our hypnobirthing journey prepared us for the most wonderful birth experience, and I would wholeheartedly recommend it to any couple, whether you are planning a natural birth or a caesarean.\u201D",
        name: "Hayley & Husband",
        location: "Hypnobirthing Sessions"
    }
];

/* DOM element references */
let currentIdx = 0;
const textEl = document.getElementById('testimonialText');
const nameEl = document.querySelector('.client-name');
const locationEl = document.querySelector('.client-location');
const dots = document.querySelectorAll('.dot');
const prevArrow = document.querySelector('.nav-arrow.left');
const nextArrow = document.querySelector('.nav-arrow.right');

/**
 * Updates the testimonial content with a fade transition.
 * @param {number} index - Index of the testimonial to show
 */
function updateTestimonial(index) {
    currentIdx = (index + testimonialsArr.length) % testimonialsArr.length;
    const t = testimonialsArr[currentIdx];

    /* Fade out, swap content, fade in */
    if (textEl) {
        textEl.style.opacity = '0';
        setTimeout(() => {
            textEl.innerText = t.text;
            textEl.style.opacity = '1';
        }, 150);
    }

    if (nameEl) {
        nameEl.style.opacity = '0';
        setTimeout(() => {
            nameEl.innerText = t.name;
            nameEl.style.opacity = '1';
        }, 150);
    }

    if (locationEl) {
        locationEl.style.opacity = '0';
        setTimeout(() => {
            locationEl.innerText = t.location;
            locationEl.style.opacity = '1';
        }, 150);
    }

    /* Highlight the active dot */
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIdx);
    });
}

/* Attach click handlers to each dot */
dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        updateTestimonial(i);
        resetAutoRotate();
    });
});

/* Reset auto rotation timer when manually clicking */
function resetAutoRotate() {
    clearInterval(autoRotateInterval);
    autoRotateInterval = setInterval(() => {
        updateTestimonial(currentIdx + 1);
    }, 7000);
}

/* Attach click handlers to arrows */
if (prevArrow) {
    prevArrow.addEventListener('click', () => {
        updateTestimonial(currentIdx - 1);
        resetAutoRotate();
    });
}

if (nextArrow) {
    nextArrow.addEventListener('click', () => {
        updateTestimonial(currentIdx + 1);
        resetAutoRotate();
    });
}

/* Auto-rotate testimonials every 7 seconds */
let autoRotateInterval = setInterval(() => {
    updateTestimonial(currentIdx + 1);
}, 7000);

/* Pause rotation on hover, resume on leave */
const testimonialSection = document.querySelector('.testimonials');
if (testimonialSection) {
    testimonialSection.addEventListener('mouseenter', () => {
        clearInterval(autoRotateInterval);
    });
    testimonialSection.addEventListener('mouseleave', () => {
        resetAutoRotate();
    });
}


/* ==========================================================
   2. SMOOTH SCROLL FOR ANCHOR LINKS
   Enables smooth scrolling when clicking in-page #hash links.
   ========================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================
// PACKAGES SECTION - EXPAND/COLLAPSE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Get all package cards
    const packageCards = document.querySelectorAll('.package-card');
    
    // Loop through each card and add click functionality to expand button
    packageCards.forEach(card => {
        const expandBtn = card.querySelector('.expand-btn');
        
        if (expandBtn) {
            expandBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent any parent click events
                
                // Get current expanded state
                const isExpanded = card.getAttribute('data-expanded') === 'true';
                
                // Toggle the expanded state
                if (isExpanded) {
                    // Collapse the card
                    card.setAttribute('data-expanded', 'false');
                    expandBtn.innerHTML = 'READ MORE <i class="fas fa-chevron-down expand-icon"></i>';
                } else {
                    // Expand the card
                    card.setAttribute('data-expanded', 'true');
                    expandBtn.innerHTML = 'READ LESS <i class="fas fa-chevron-up expand-icon"></i>';
                    
                    // Optional: Smooth scroll to the expanded card
                    setTimeout(() => {
                        const cardRect = card.getBoundingClientRect();
                        const isVisible = (cardRect.top >= 0 && cardRect.bottom <= window.innerHeight);
                        
                        if (!isVisible) {
                            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                }
            });
        }
        
        // Optional: Close expanded card when clicking outside (if needed)
        // This is commented out to keep functionality simple
    });
    
    // Optional: Ensure that when one card expands, others can remain expanded
    // This allows multiple cards to be expanded at once
    console.log('Expand/collapse functionality initialized');
});
/* ==========================================================
   3. BUTTON HOVER ANIMATIONS
   Slides the arrow icon right on hover for all CTA buttons.
   ========================================================== */

const allButtons = document.querySelectorAll('.btn-beige, .btn-dark, .card-btn, .book-now-btn, .btn-outline');
allButtons.forEach(btn => {
    btn.addEventListener('mouseenter', function () {
        const icon = this.querySelector('i');
        if (icon) icon.style.transform = 'translateX(5px)';
    });
    btn.addEventListener('mouseleave', function () {
        const icon = this.querySelector('i');
        if (icon) icon.style.transform = 'translateX(0)';
    });
});


/* ==========================================================
   4. SCROLL-TRIGGERED FADE-IN ANIMATIONS
   Sections fade up into view as the user scrolls down.
   Uses IntersectionObserver for performance.
   ========================================================== */

const sections = document.querySelectorAll(
    '.who-we-are, .packages, .midwife-section, .serve-section, ' +
    '.testimonials, .birthing-choices, .get-in-touch, .thank-you-section'
);

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            sectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

/* Set initial hidden state and start observing */
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    sectionObserver.observe(section);
});


/* ==========================================================
   5. MOBILE MENU TOGGLE
   Shows/hides nav links when hamburger button is tapped.
   ========================================================== */

(function () {
    /* Wait for components.js to inject the navbar */
    function initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        if (!menuBtn || !navLinks) return;

        menuBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.contains('mobile-open');
            if (isOpen) {
                navLinks.classList.remove('mobile-open');
                navLinks.style.display = '';
            } else {
                navLinks.classList.add('mobile-open');
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.gap = '15px';
                navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                navLinks.style.zIndex = '100';
            }
        });
    }

    /* Run after a short delay to ensure components are injected */
    setTimeout(initMobileMenu, 100);
})();


/* ==========================================================
   6. GALLERY AUTO-LOOP MARQUEE
   Automatically scrolls the gallery continuously.
   ========================================================== */

(function () {
    function initGalleryLoop() {
        const galleries = document.querySelectorAll('.gallery');
        galleries.forEach(gallery => {
            if (gallery.querySelector('.gallery-track')) return; // Already initialized
            
            const originalItems = Array.from(gallery.children);
            if (originalItems.length === 0) return;

            // Add Instagram overlay to every gallery item
            originalItems.forEach(item => {
                // Only add if overlay doesn't already exist
                if (!item.querySelector('.ig-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'ig-overlay';
                    const icon = document.createElement('i');
                    icon.className = 'fab fa-instagram';
                    overlay.appendChild(icon);
                    item.appendChild(overlay);
                }
            });

            // Create the track element that will animate
            const track = document.createElement('div');
            track.className = 'gallery-track';

            // Append all original items to the track
            originalItems.forEach(item => track.appendChild(item));

            // Clone and append items for a seamless loop
            originalItems.forEach(item => {
                const clone = item.cloneNode(true);
                track.appendChild(clone);
            });

            // Put the track back into the gallery wrapper
            gallery.appendChild(track);
        });
    }

    /* Initialise after components are loaded */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGalleryLoop);
    } else {
        initGalleryLoop();
    }
})();

  
  
// ========== PDF DOWNLOAD FROM PDFS FOLDER ==========
// Note: courses.html pages folder mein hai, isliye path mein "../" lagega

function downloadActualPDF(pdfFileName, displayName) {
    // pages folder se root folder mein jane ke liye "../" use karna hoga
    // phir pdfs folder mein jaana hai
    const pdfPath = `../pdf/${pdfFileName}`;
    
    console.log('Downloading from:', pdfPath); // Debug ke liye
    
    // Create anchor element for download
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = displayName;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getPdfMetaByType(pdfType) {
    if (window.MIM_MANAGED_COURSES && window.MIM_MANAGED_COURSES[pdfType]) {
        return window.MIM_MANAGED_COURSES[pdfType];
    }

    if (pdfType === 'biomechanics') {
        return { pdfType, title: 'Biomechanics in Labour', tagline: 'How Your Body Moves, How Your Baby Navigates', price: '£19.99', imagePath: '../images/yoga.jpg', fileName: 'MIM-Biomechanics-in-Labour.pdf', downloadName: 'MIM_Biomechanics_in_Labour.pdf' };
    }
    if (pdfType === 'babymoon') {
        return { pdfType, title: 'The Baby Moon', tagline: '40 Days of Postpartum Nourishment', price: '£19.99', imagePath: '../images/yoga2.png', fileName: 'MIM-Baby-Moon-40-Days.pdf', downloadName: 'MIM_Baby_Moon_40_Days.pdf' };
    }
    if (pdfType === 'hypnobirthing') {
        return { pdfType, title: 'Hypnobirthing', tagline: 'A Complete Guid for You and Your Birth Partner', price: '£19.99', imagePath: '../images/yog.jpg', fileName: 'MIM-Hypnobirthing-Course.pdf', downloadName: 'MIM_Hypnobirthing_Course.pdf' };
    }
    return null;
}

let stripeInstance = null;
let stripeElements = null;
let stripeCardNumber = null;
let stripeCardExpiry = null;
let stripeCardCvc = null;
let paidDownloadUrl = '';
let paidDownloadName = 'course.pdf';
let subscriptionCardNumber = null;
let subscriptionCardExpiry = null;
let subscriptionCardCvc = null;

const subscriptionPlanMeta = {
    core: {
        title: 'MIM Core Support',
        tagline: 'Consistent midwife support throughout pregnancy',
        price: '\u00a379.99/month',
        imagePath: '../images/offer1.png'
    },
    signature: {
        title: 'MIM Signature Support',
        tagline: 'Enhanced support with extended midwife access',
        price: '\u00a3149.99/month',
        imagePath: '../images/signature-support.jpeg'
    },
    sustained: {
        title: 'MIM Sustained Support',
        tagline: 'Complete continuity of care in one package',
        price: '\u00a31,399 one payment',
        imagePath: '../images/offer3.png'
    }
};

async function initializeStripePaymentFields() {
    if (!document.getElementById('payCardNumber') || typeof Stripe === 'undefined') return;
    if (stripeInstance && stripeElements && stripeCardNumber && stripeCardExpiry && stripeCardCvc) return;

    const response = await fetch('/api/stripe-config');
    const config = await response.json();
    if (!response.ok) throw new Error(config.error || 'Stripe is not configured.');

    stripeInstance = Stripe(config.publishableKey);
    stripeElements = stripeInstance.elements();

    const fieldStyle = {
        base: {
            color: '#111111',
            fontFamily: '"Albert Sans", sans-serif',
            fontSize: '15px',
            '::placeholder': {
                color: '#8a8a8a'
            }
        },
        invalid: {
            color: '#b00020'
        }
    };

    stripeCardNumber = stripeElements.create('cardNumber', { style: fieldStyle, placeholder: '1234 5678 9012 3456' });
    stripeCardExpiry = stripeElements.create('cardExpiry', { style: fieldStyle, placeholder: 'MM/YY' });
    stripeCardCvc = stripeElements.create('cardCvc', { style: fieldStyle, placeholder: '123' });

    stripeCardNumber.mount('#payCardNumber');
    stripeCardExpiry.mount('#payExpiry');
    stripeCardCvc.mount('#payCvc');
}

async function initializeSubscriptionPaymentFields() {
    if (!document.getElementById('subCardNumber') || typeof Stripe === 'undefined') return;
    if (stripeInstance && subscriptionCardNumber && subscriptionCardExpiry && subscriptionCardCvc) return;

    const response = await fetch('/api/stripe-config');
    const config = await response.json();
    if (!response.ok) throw new Error(config.error || 'Stripe is not configured.');

    stripeInstance = stripeInstance || Stripe(config.publishableKey);
    stripeElements = stripeElements || stripeInstance.elements();

    const fieldStyle = {
        base: {
            color: '#111111',
            fontFamily: '"Albert Sans", sans-serif',
            fontSize: '15px',
            '::placeholder': {
                color: '#8a8a8a'
            }
        },
        invalid: {
            color: '#b00020'
        }
    };

    subscriptionCardNumber = stripeElements.create('cardNumber', { style: fieldStyle, placeholder: '1234 5678 9012 3456' });
    subscriptionCardExpiry = stripeElements.create('cardExpiry', { style: fieldStyle, placeholder: 'MM/YY' });
    subscriptionCardCvc = stripeElements.create('cardCvc', { style: fieldStyle, placeholder: '123' });

    subscriptionCardNumber.mount('#subCardNumber');
    subscriptionCardExpiry.mount('#subExpiry');
    subscriptionCardCvc.mount('#subCvc');
}

function openPaymentModal(pdfMeta) {
    const modalOverlay = document.getElementById('paymentModal');
    const subtitleEl = document.getElementById('paymentSubtitle');
    const courseImageEl = document.getElementById('paymentCourseImage');
    const courseTitleEl = document.getElementById('paymentCourseTitle');
    const courseTaglineEl = document.getElementById('paymentCourseTagline');
    const coursePriceEl = document.getElementById('paymentCoursePrice');

    if (!modalOverlay) return;

    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalOverlay.dataset.pdfType = pdfMeta.pdfType;

    if (subtitleEl) {
        subtitleEl.textContent = 'Enter your details and pay to download the PDF.';
    }

    if (courseImageEl) {
        courseImageEl.src = pdfMeta.imagePath || '';
        courseImageEl.alt = pdfMeta.title || '';
    }

    if (courseTitleEl) {
        courseTitleEl.textContent = pdfMeta.title || '';
    }

    if (courseTaglineEl) {
        courseTaglineEl.textContent = pdfMeta.tagline || '';
    }

    if (coursePriceEl) {
        coursePriceEl.textContent = pdfMeta.price || '';
    }

    const errorEl = document.getElementById('paymentError');
    if (errorEl) errorEl.textContent = '';

    const firstNameEl = document.getElementById('payFirstName');
    if (firstNameEl) firstNameEl.focus();

    initializeStripePaymentFields().catch(error => {
        if (errorEl) errorEl.textContent = error.message || 'Stripe is not available right now.';
    });
}

function closePaymentModal() {
    const modalOverlay = document.getElementById('paymentModal');
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    delete modalOverlay.dataset.pdfType;
}

function setPaymentSubmitting(isSubmitting) {
    const submitBtn = document.getElementById('paySubmitBtn');
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.style.opacity = isSubmitting ? '0.75' : '1';
    submitBtn.style.cursor = isSubmitting ? 'not-allowed' : 'pointer';
}

function showPaymentResultModal(isSuccess, message, downloadUrl, downloadName) {
    const modalOverlay = document.getElementById('paymentResultModal');
    const titleEl = document.getElementById('paymentResultTitle');
    const messageEl = document.getElementById('paymentResultMessage');
    const downloadBtn = document.getElementById('downloadPaidPdfBtn');

    if (!modalOverlay) return;

    if (titleEl) titleEl.textContent = isSuccess ? 'Payment Successful' : 'Payment Failed';
    if (messageEl) messageEl.textContent = message;
    if (downloadBtn) {
        downloadBtn.href = downloadUrl || '#';
        downloadBtn.style.display = isSuccess ? 'inline-flex' : 'none';
    }

    paidDownloadUrl = isSuccess && downloadUrl ? downloadUrl : '';
    paidDownloadName = isSuccess && downloadName ? downloadName : 'course.pdf';
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
}

function closePaymentResultModal() {
    const modalOverlay = document.getElementById('paymentResultModal');
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
}

function validatePaymentForm() {
    const firstName = document.getElementById('payFirstName');
    const lastName = document.getElementById('payLastName');
    const address = document.getElementById('payAddress');
    const email = document.getElementById('payEmail');

    const fields = [firstName, lastName, address, email];
    const missing = fields.some(el => !el || !String(el.value || '').trim());
    if (missing) return 'Please fill in all fields.';
    if (email && !email.checkValidity()) return 'Please enter a valid email address.';

    if (!stripeInstance || !stripeCardNumber) return 'Card payment is not ready yet. Please try again.';

    return null;
}

function openSubscriptionPaymentModal(planId) {
    const modalOverlay = document.getElementById('subscriptionPaymentModal');
    const plan = subscriptionPlanMeta[planId];
    if (!modalOverlay || !plan) return;

    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalOverlay.dataset.planId = planId;

    const titleEl = document.getElementById('subscriptionPaymentTitle');
    const subtitleEl = document.getElementById('subscriptionPaymentSubtitle');
    const imageEl = document.getElementById('subscriptionPlanImage');
    const planTitleEl = document.getElementById('subscriptionPlanTitle');
    const planTaglineEl = document.getElementById('subscriptionPlanTagline');
    const planPriceEl = document.getElementById('subscriptionPlanPrice');
    const errorEl = document.getElementById('subscriptionPaymentError');

    if (titleEl) titleEl.textContent = plan.title;
    if (subtitleEl) subtitleEl.textContent = 'Enter your details and pay securely by card.';
    if (imageEl) {
        imageEl.src = plan.imagePath;
        imageEl.alt = plan.title;
    }
    if (planTitleEl) planTitleEl.textContent = plan.title;
    if (planTaglineEl) planTaglineEl.textContent = plan.tagline;
    if (planPriceEl) planPriceEl.textContent = plan.price;
    if (errorEl) errorEl.textContent = '';

    const firstNameEl = document.getElementById('subFirstName');
    if (firstNameEl) firstNameEl.focus();

    initializeSubscriptionPaymentFields().catch(error => {
        if (errorEl) errorEl.textContent = error.message || 'Stripe is not available right now.';
    });
}

function closeSubscriptionPaymentModal() {
    const modalOverlay = document.getElementById('subscriptionPaymentModal');
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    delete modalOverlay.dataset.planId;
}

function setSubscriptionSubmitting(isSubmitting) {
    const submitBtn = document.getElementById('subscriptionPaySubmitBtn');
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.style.opacity = isSubmitting ? '0.75' : '1';
    submitBtn.style.cursor = isSubmitting ? 'not-allowed' : 'pointer';
}

function showSubscriptionResultModal(isSuccess, message) {
    const modalOverlay = document.getElementById('subscriptionResultModal');
    const titleEl = document.getElementById('subscriptionResultTitle');
    const messageEl = document.getElementById('subscriptionResultMessage');
    if (!modalOverlay) return;

    if (titleEl) titleEl.textContent = isSuccess ? 'Payment Successful' : 'Payment Failed';
    if (messageEl) messageEl.textContent = message;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
}

function closeSubscriptionResultModal() {
    const modalOverlay = document.getElementById('subscriptionResultModal');
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
}

function validateSubscriptionPaymentForm() {
    const fields = ['subFirstName', 'subLastName', 'subEmail', 'subAddress'].map(id => document.getElementById(id));
    const missing = fields.some(el => !el || !String(el.value || '').trim());
    if (missing) return 'Please fill in all required fields.';

    const email = document.getElementById('subEmail');
    if (email && !email.checkValidity()) return 'Please enter a valid email address.';
    if (!stripeInstance || !subscriptionCardNumber) return 'Card payment is not ready yet. Please try again.';

    return null;
}

document.addEventListener('DOMContentLoaded', function () {
    const downloadButtons = document.querySelectorAll('.btn-download-dark[data-pdf], .btn-download-light[data-pdf]');
    const modalOverlay = document.getElementById('paymentModal');

    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const pdfType = this.getAttribute('data-pdf');
            const pdfMeta = getPdfMetaByType(pdfType);
            if (!pdfMeta) return;

            if (!modalOverlay) {
                downloadActualPDF(pdfMeta.fileName, pdfMeta.downloadName);
                return;
            }

            openPaymentModal(pdfMeta);
        });
    });

    if (modalOverlay) {
        const closeBtn = modalOverlay.querySelector('.payment-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closePaymentModal);
        }

        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) closePaymentModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closePaymentModal();
        });

        const form = document.getElementById('paymentForm');
        const errorEl = document.getElementById('paymentError');

        if (form) {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                if (errorEl) errorEl.textContent = '';

                const validationError = validatePaymentForm();
                if (validationError) {
                    if (errorEl) errorEl.textContent = validationError;
                    return;
                }

                const pdfType = modalOverlay.dataset.pdfType;
                const pdfMeta = getPdfMetaByType(pdfType);
                if (!pdfMeta) return;

                setPaymentSubmitting(true);
                try {
                    const customer = {
                        firstName: document.getElementById('payFirstName').value.trim(),
                        lastName: document.getElementById('payLastName').value.trim(),
                        address: document.getElementById('payAddress').value.trim(),
                        email: document.getElementById('payEmail').value.trim()
                    };

                    const intentResponse = await fetch('/api/create-payment-intent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ courseId: pdfMeta.pdfType, customer })
                    });
                    const intentData = await intentResponse.json();
                    if (!intentResponse.ok) throw new Error(intentData.error || 'Unable to start payment.');

                    const result = await stripeInstance.confirmCardPayment(intentData.clientSecret, {
                        payment_method: {
                            card: stripeCardNumber,
                            billing_details: {
                                name: `${customer.firstName} ${customer.lastName}`,
                                email: customer.email,
                                address: {
                                    line1: customer.address
                                }
                            }
                        }
                    });

                    if (result.error) throw new Error(result.error.message || 'Payment failed.');
                    if (!result.paymentIntent || result.paymentIntent.status !== 'succeeded') {
                        throw new Error('Payment was not successful.');
                    }

                    const tokenResponse = await fetch('/api/create-download-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentIntentId: result.paymentIntent.id })
                    });
                    const tokenData = await tokenResponse.json();
                    if (!tokenResponse.ok) throw new Error(tokenData.error || 'Unable to prepare the download.');

                    closePaymentModal();
                    showPaymentResultModal(true, 'Your payment was successful. Your PDF is ready to download, and a confirmation email will be sent shortly.', tokenData.downloadUrl, tokenData.downloadName || pdfMeta.downloadName);
                    form.reset();
                    if (stripeCardNumber) stripeCardNumber.clear();
                    if (stripeCardExpiry) stripeCardExpiry.clear();
                    if (stripeCardCvc) stripeCardCvc.clear();
                } catch (error) {
                    showPaymentResultModal(false, error.message || 'Payment failed. Please try again.');
                } finally {
                    setPaymentSubmitting(false);
                }
            });
        }
    }

    const resultModal = document.getElementById('paymentResultModal');
    if (resultModal) {
        const closeBtn = resultModal.querySelector('.payment-close');
        if (closeBtn) closeBtn.addEventListener('click', closePaymentResultModal);

        resultModal.addEventListener('click', function (e) {
            if (e.target === resultModal) closePaymentResultModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && resultModal.classList.contains('open')) closePaymentResultModal();
        });
    }

    const downloadBtn = document.getElementById('downloadPaidPdfBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            if (!paidDownloadUrl) {
                return;
            }

            const originalText = downloadBtn.innerHTML;
            downloadBtn.style.pointerEvents = 'none';
            downloadBtn.style.opacity = '0.75';
            downloadBtn.innerHTML = 'Preparing... <i class="fas fa-download"></i>';

            try {
                const response = await fetch(paidDownloadUrl);
                if (!response.ok) throw new Error('Download link is invalid or expired.');

                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = paidDownloadName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } catch (error) {
                showPaymentResultModal(false, error.message || 'Unable to download the PDF. Please try again.');
            } finally {
                downloadBtn.innerHTML = originalText;
                downloadBtn.style.pointerEvents = '';
                downloadBtn.style.opacity = '';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactRequestForm');
    if (contactForm) {
        const statusEl = document.getElementById('contactFormStatus');
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (statusEl) {
                statusEl.textContent = '';
                statusEl.classList.remove('is-success', 'is-error');
            }

            const payload = Object.fromEntries(new FormData(contactForm).entries());
            payload.consent = Boolean(contactForm.querySelector('input[name="consent"]:checked'));

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.75';
            }

            try {
                const response = await fetch('/api/contact-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Unable to submit your request.');

                contactForm.reset();
                if (statusEl) {
                    statusEl.textContent = data.message || 'Thank you. Your request has been received.';
                    statusEl.classList.add('is-success');
                }
            } catch (error) {
                if (statusEl) {
                    statusEl.textContent = error.message || 'Unable to submit your request. Please try again.';
                    statusEl.classList.add('is-error');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '';
                }
            }
        });
    }

    const subscriptionButtons = document.querySelectorAll('.subscription-pay-btn[data-plan]');
    subscriptionButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openSubscriptionPaymentModal(this.getAttribute('data-plan'));
        });
    });

    const subscriptionModal = document.getElementById('subscriptionPaymentModal');
    if (subscriptionModal) {
        const closeBtn = subscriptionModal.querySelector('.payment-close');
        if (closeBtn) closeBtn.addEventListener('click', closeSubscriptionPaymentModal);

        subscriptionModal.addEventListener('click', function (e) {
            if (e.target === subscriptionModal) closeSubscriptionPaymentModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && subscriptionModal.classList.contains('open')) closeSubscriptionPaymentModal();
        });
    }

    const subscriptionForm = document.getElementById('subscriptionPaymentForm');
    if (subscriptionForm) {
        const errorEl = document.getElementById('subscriptionPaymentError');

        subscriptionForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (errorEl) errorEl.textContent = '';

            const validationError = validateSubscriptionPaymentForm();
            if (validationError) {
                if (errorEl) errorEl.textContent = validationError;
                return;
            }

            const planId = document.getElementById('subscriptionPaymentModal').dataset.planId;
            const customer = {
                firstName: document.getElementById('subFirstName').value.trim(),
                lastName: document.getElementById('subLastName').value.trim(),
                email: document.getElementById('subEmail').value.trim(),
                phone: document.getElementById('subPhone').value.trim(),
                address: document.getElementById('subAddress').value.trim()
            };

            setSubscriptionSubmitting(true);
            try {
                const response = await fetch('/api/create-subscription-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId, customer })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Unable to start payment.');

                const result = await stripeInstance.confirmCardPayment(data.clientSecret, {
                    payment_method: {
                        card: subscriptionCardNumber,
                        billing_details: {
                            name: `${customer.firstName} ${customer.lastName}`,
                            email: customer.email,
                            phone: customer.phone || undefined,
                            address: {
                                line1: customer.address
                            }
                        }
                    }
                });

                if (result.error) throw new Error(result.error.message || 'Payment failed.');
                if (!result.paymentIntent || result.paymentIntent.status !== 'succeeded') {
                    throw new Error('Payment was not successful.');
                }

                const emailResponse = await fetch('/api/confirm-customer-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentIntentId: data.paymentIntentId || result.paymentIntent.id,
                        subscriptionId: data.subscriptionId
                    })
                });
                const emailData = await emailResponse.json();
                if (!emailResponse.ok) throw new Error(emailData.error || 'Payment succeeded, but the confirmation email could not be triggered.');

                closeSubscriptionPaymentModal();
                showSubscriptionResultModal(true, 'Your payment was successful. You will receive a confirmation email shortly.');
                subscriptionForm.reset();
                if (subscriptionCardNumber) subscriptionCardNumber.clear();
                if (subscriptionCardExpiry) subscriptionCardExpiry.clear();
                if (subscriptionCardCvc) subscriptionCardCvc.clear();
            } catch (error) {
                showSubscriptionResultModal(false, error.message || 'Payment failed. Please try again.');
            } finally {
                setSubscriptionSubmitting(false);
            }
        });
    }

    const subscriptionResultModal = document.getElementById('subscriptionResultModal');
    if (subscriptionResultModal) {
        const closeBtn = subscriptionResultModal.querySelector('.payment-close');
        if (closeBtn) closeBtn.addEventListener('click', closeSubscriptionResultModal);

        subscriptionResultModal.addEventListener('click', function (e) {
            if (e.target === subscriptionResultModal) closeSubscriptionResultModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && subscriptionResultModal.classList.contains('open')) closeSubscriptionResultModal();
        });
    }
});
/* ==========================================================
   7. FAQ ACCORDION
   Click a question to expand/collapse its answer.
   Only one item can be open at a time.
   ========================================================== */

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            /* Close all items first */
            faqItems.forEach(faq => {
                faq.classList.remove('open');
                const icon = faq.querySelector('.fas');
                if (icon) {
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                }
            });

            /* Toggle the clicked item */
            if (!isOpen) {
                item.classList.add('open');
                const icon = item.querySelector('.fas');
                if (icon) {
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                }
            }
        });
    }
});


/* ==========================================================
   INITIALISATION LOG
   ========================================================== */
console.log('My Instant Midwife - Website Loaded Successfully');

/* ==========================================================
   DASHBOARD CONTENT HYDRATION
   Reads optional dashboard-managed content. Hardcoded HTML stays
   as fallback if dashboard feed is unavailable.
   ========================================================== */

(function () {
    const courseFiles = {
        biomechanics: {
            fileName: 'MIM-Biomechanics-in-Labour.pdf',
            downloadName: 'MIM_Biomechanics_in_Labour.pdf'
        },
        babymoon: {
            fileName: 'MIM-Baby-Moon-40-Days.pdf',
            downloadName: 'MIM_Baby_Moon_40_Days.pdf'
        },
        hypnobirthing: {
            fileName: 'MIM-Hypnobirthing-Course.pdf',
            downloadName: 'MIM_Hypnobirthing_Course.pdf'
        }
    };

    function dashboardOrigins() {
        if (window.MIM_DASHBOARD_CONTENT_URL) return [window.MIM_DASHBOARD_CONTENT_URL];

        const urls = [];
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            urls.push('http://localhost:3100/api/public-content');
        } else {
            const host = location.hostname.replace(/^www\./, '');
            urls.push(`${location.protocol}//dashboard.${host}/api/public-content`);
        }
        urls.push('/api/public-content');
        return [...new Set(urls)];
    }

    async function fetchManagedContent() {
        for (const url of dashboardOrigins()) {
            try {
                const content = await requestJson(url, 2500);
                return { content, feedUrl: new URL(url, location.href) };
            } catch (error) {
                try {
                    const content = await requestScript(url);
                    return { content, feedUrl: new URL(url, location.href) };
                } catch (scriptError) {
                    // Keep trying next source.
                }
            }
        }
        return null;
    }

    function requestJson(url, timeoutMs) {
        if (typeof fetch === 'function' && typeof AbortController === 'function') {
            return new Promise((resolve, reject) => {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), timeoutMs);
                fetch(url, { signal: controller.signal })
                    .then(response => {
                        clearTimeout(timeout);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        return response.json();
                    })
                    .then(resolve)
                    .catch(error => {
                        clearTimeout(timeout);
                        reject(error);
                    });
            });
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = timeoutMs;
            xhr.onload = () => {
                if (xhr.status < 200 || xhr.status >= 300) {
                    reject(new Error(`HTTP ${xhr.status}`));
                    return;
                }
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (error) {
                    reject(error);
                }
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.ontimeout = () => reject(new Error('Request timed out'));
            xhr.send();
        });
    }

    function requestScript(url) {
        return new Promise((resolve, reject) => {
            const feedUrl = new URL(url, location.href);
            feedUrl.pathname = feedUrl.pathname.replace(/\/api\/public-content$/, '/api/public-content.js');
            window.MIM_DASHBOARD_CONTENT = null;

            const script = document.createElement('script');
            script.src = feedUrl.href;
            script.async = true;
            script.onload = () => {
                script.remove();
                if (window.MIM_DASHBOARD_CONTENT) {
                    resolve(window.MIM_DASHBOARD_CONTENT);
                } else {
                    reject(new Error('Dashboard script did not provide content.'));
                }
            };
            script.onerror = () => {
                script.remove();
                reject(new Error('Dashboard script failed.'));
            };
            document.head.appendChild(script);
        });
    }

    function setText(selector, value) {
        const el = document.querySelector(selector);
        if (el && value) el.textContent = value;
    }

    function setImage(selector, src, feedUrl) {
        const el = document.querySelector(selector);
        if (!el || !src) return;
        el.src = resolveImage(src, feedUrl);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;');
    }

    function setBackground(selector, src, feedUrl) {
        const el = document.querySelector(selector);
        if (!el || !src) return;
        el.style.backgroundImage = `url("${resolveImage(src, feedUrl)}")`;
    }

    function resolveImage(src, feedUrl) {
        if (/^https?:\/\//i.test(src)) return src;
        if (src.startsWith('/site-images/')) return `/images/${src.replace('/site-images/', '')}`;
        if (src.startsWith('/uploads/')) return new URL(src, feedUrl.origin).href;
        return src;
    }

    function iconHtml(className) {
        return `<i class="${className}"></i>`;
    }

    function hydrateHero(content, feedUrl) {
        if (!content.home || !content.home.hero) return;
        const hero = content.home.hero;
        setText('.hero-welcome', hero.eyebrow);
        setText('.hero-title', hero.title);
        setText('.hero-desc', hero.body);
        setImage('.hero-img img', hero.image, feedUrl);
        const innerHero = document.querySelector('.inner-hero');
        if (innerHero && hero.image) {
            innerHero.style.backgroundImage = `url("${resolveImage(hero.image, feedUrl)}")`;
        }
    }

    function hydrateWho(content, feedUrl) {
        if (!content.home || !content.home.who) return;
        const who = content.home.who;
        setText('.who-right h2', who.title);
        setText('.who-right h3', who.subtitle);
        setText('.who-right .midwife-names', who.name);
        setText('.who-right p', who.body);
        setImage('.who-left img', who.image, feedUrl);

        setText('.who-right-about h2', who.title);
        setText('.who-right-about h3', who.subtitle);
        setText('.who-right-about p strong', who.name);
        setImage('.who-left-about img', who.image, feedUrl);
    }

    function hydratePackages(content, feedUrl) {
        if (!Array.isArray(content.packages)) return;

        content.packages.forEach((plan, index) => {
            const card = document.querySelectorAll('.package-card')[index];
            if (!card) return;

            const image = card.querySelector('.card-img');
            const title = card.querySelector('.card-title');
            const list = card.querySelector('.check-list');
            const price = card.querySelector('.price');
            const note = card.querySelector('.price-note');

            if (image && plan.image) image.style.backgroundImage = `url("${resolveImage(plan.image, feedUrl)}")`;
            if (title && plan.title) title.textContent = plan.title;
            if (list && Array.isArray(plan.features)) {
                list.innerHTML = plan.features.map(feature => (
                    `<div class="check-item">${iconHtml('fas fa-check-circle')} ${escapeHtml(feature)}</div>`
                )).join('');
            }
            if (price && plan.price) {
                price.innerHTML = `${escapeHtml(plan.price)}<span class="price-period">${escapeHtml(plan.period || '')}</span>`;
            }
            if (note && plan.note) note.textContent = plan.note;

            if (plan.id && subscriptionPlanMeta[plan.id]) {
                subscriptionPlanMeta[plan.id].title = plan.title || subscriptionPlanMeta[plan.id].title;
                subscriptionPlanMeta[plan.id].price = [plan.price, plan.period].filter(Boolean).join(' ');
                subscriptionPlanMeta[plan.id].imagePath = resolveImage(plan.image, feedUrl);
                subscriptionPlanMeta[plan.id].tagline = plan.note || subscriptionPlanMeta[plan.id].tagline;
            }
        });
    }

    function hydrateCourses(content, feedUrl) {
        if (!Array.isArray(content.courses)) return;
        window.MIM_MANAGED_COURSES = window.MIM_MANAGED_COURSES || {};

        const courseSections = document.querySelectorAll('.birthing-choices, .birthing-choices-white');
        content.courses.forEach((course, index) => {
            const section = courseSections[index];
            const imagePath = resolveImage(course.image, feedUrl);
            if (section) {
                setTextIn(section, 'h2', course.title);
                setTextIn(section, 'h3', course.subtitle);
                setTextIn(section, '.course-price', course.price);
                setTextIn(section, 'p', course.body);
                const img = section.querySelector('img');
                if (img && course.image) img.src = imagePath;
            }

            if (course.id && courseFiles[course.id]) {
                window.MIM_MANAGED_COURSES[course.id] = {
                    pdfType: course.id,
                    title: course.title,
                    tagline: course.subtitle,
                    price: course.price,
                    imagePath,
                    ...courseFiles[course.id]
                };
            }
        });
    }

    function setTextIn(root, selector, value) {
        const el = root.querySelector(selector);
        if (el && value) el.textContent = value;
    }

    function hydrateFooter(content) {
        if (!content.footer) return;
        setText('.questions-text h3', content.footer.questionTitle);
        setText('.questions-text p', content.footer.questionBody);

        document.querySelectorAll('.social-icons a[aria-label="Facebook"], .social-icons a .fa-facebook-f').forEach(item => {
            const link = item.closest('a') || item;
            if (content.footer.facebookUrl) link.href = content.footer.facebookUrl;
        });
        document.querySelectorAll('.social-icons a[aria-label="Instagram"], .social-icons a .fa-instagram').forEach(item => {
            const link = item.closest('a') || item;
            if (content.footer.instagramUrl) link.href = content.footer.instagramUrl;
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const result = await fetchManagedContent();
        if (!result || !result.content) return;

        hydrateHero(result.content, result.feedUrl);
        hydrateWho(result.content, result.feedUrl);
        hydratePackages(result.content, result.feedUrl);
        hydrateCourses(result.content, result.feedUrl);
        hydrateFooter(result.content);
    });
})();
