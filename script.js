
const EMAILJS_PUBLIC_KEY  = '6Kmy9llwHKdsswbL8';   
const EMAILJS_SERVICE_ID  = 'service_rb7zmte';   
const EMAILJS_TEMPLATE_ID = 'template_zey0jtg';  

// =============================================
//  INITIALISE EmailJS
// =============================================
(function () {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
})();

// =============================================
//  DOM REFERENCES
// =============================================
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('nav-links');
const darkToggle  = document.getElementById('darkModeToggle');
const darkIcon    = document.getElementById('darkModeIcon');
const navbar      = document.getElementById('navbar');
const allNavLinks = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('section[id]');

// =============================================
//  HAMBURGER MENU
// =============================================
if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close menu when a nav link is clicked
    allNavLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target)) {
            navLinks.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// =============================================
//  ACTIVE NAV LINK ON SCROLL
// =============================================
function updateActiveNav() {
    let currentSection = '';
    const scrollY = window.scrollY + 100; // offset for sticky nav

    sections.forEach(function (section) {
        const sectionTop    = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    allNavLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav(); 

// =============================================
//  DARK MODE
// =============================================
function applyDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    if (darkIcon) {
        darkIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (darkToggle) {
        darkToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        darkToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

// Load saved preference
const savedDarkMode = localStorage.getItem('darkMode') === 'true';
applyDarkMode(savedDarkMode);

// Toggle on button click
if (darkToggle) {
    darkToggle.addEventListener('click', function () {
        const isDark = document.body.classList.contains('dark-mode');
        applyDarkMode(!isDark);
        localStorage.setItem('darkMode', (!isDark).toString());
    });
}

// =============================================
//  FORM VALIDATION HELPERS
// =============================================
function getField(id)    { return document.getElementById(id); }
function getError(id)    { return document.getElementById(id + '-error'); }

function showError(fieldId, message) {
    const field = getField(fieldId);
    const error = getError(fieldId);
    if (field) field.classList.add('invalid');
    if (error) error.textContent = message;
}

function clearError(fieldId) {
    const field = getField(fieldId);
    const error = getError(fieldId);
    if (field) field.classList.remove('invalid');
    if (error) error.textContent = '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
    let isValid = true;

    const name    = getField('name');
    const email   = getField('email');
    const subject = getField('subject');
    const message = getField('message');

    // Clear all errors first
    ['name', 'email', 'subject', 'message'].forEach(clearError);

    // Name validation
    if (!name || name.value.trim().length < 2) {
        showError('name', 'Please enter your full name (at least 2 characters).');
        isValid = false;
    }

    // Email validation
    if (!email || email.value.trim() === '') {
        showError('email', 'Please enter your email address.');
        isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
        showError('email', 'Please enter a valid email address (e.g. you@example.com).');
        isValid = false;
    }

    // Subject validation
    if (!subject || subject.value.trim().length < 3) {
        showError('subject', 'Please enter a subject (at least 3 characters).');
        isValid = false;
    }

    // Message validation
    if (!message || message.value.trim().length < 10) {
        showError('message', 'Please enter a message (at least 10 characters).');
        isValid = false;
    }

    return isValid;
}

// Real-time inline validation (on blur)
['name', 'email', 'subject', 'message'].forEach(function (id) {
    const field = getField(id);
    if (field) {
        field.addEventListener('blur', function () {
            // Only validate if the field has been touched
            if (field.value.trim() !== '') {
                validateField(id);
            }
        });
        field.addEventListener('input', function () {
            clearError(id);
        });
    }
});

function validateField(id) {
    clearError(id);
    const field = getField(id);
    if (!field) return;
    const val = field.value.trim();

    if (id === 'name'    && val.length < 2)      showError('name',    'Name must be at least 2 characters.');
    if (id === 'email'   && !isValidEmail(val))  showError('email',   'Enter a valid email address.');
    if (id === 'subject' && val.length < 3)      showError('subject', 'Subject must be at least 3 characters.');
    if (id === 'message' && val.length < 10)     showError('message', 'Message must be at least 10 characters.');
}

// =============================================
//  FORM SUBMISSION WITH EMAILJS
// =============================================
function handleFormSubmit() {
    // Hide previous status messages
    const successBox = document.getElementById('form-success');
    const errorBox   = document.getElementById('form-error');
    if (successBox) successBox.style.display = 'none';
    if (errorBox)   errorBox.style.display   = 'none';

    // Validate form
    if (!validateForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled    = true;
        submitBtn.innerHTML   = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    const templateParams = {
        from_name:    getField('name')    ? getField('name').value.trim()    : '',
        from_email:   getField('email')   ? getField('email').value.trim()   : '',
        subject:      getField('subject') ? getField('subject').value.trim() : '',
        message:      getField('message') ? getField('message').value.trim() : '',
        to_name:      'Prajwal',
    };

    // Check if EmailJS keys have been set
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
        // Demo mode: simulate success
        setTimeout(function () {
            showFormSuccess();
            if (submitBtn) {
                submitBtn.disabled  = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            }
        }, 1200);
        return;
    }

    // Real EmailJS send
    if (typeof emailjs !== 'undefined') {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function () {
                showFormSuccess();
            })
            .catch(function (error) {
                console.error('EmailJS error:', error);
                if (errorBox) errorBox.style.display = 'flex';
            })
            .finally(function () {
                if (submitBtn) {
                    submitBtn.disabled  = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                }
            });
    } else {
        // EmailJS SDK not loaded
        if (errorBox) errorBox.style.display = 'flex';
        if (submitBtn) {
            submitBtn.disabled  = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
    }
}

function showFormSuccess() {
    const successBox = document.getElementById('form-success');
    if (successBox) successBox.style.display = 'flex';

    // Reset form fields
    ['name', 'email', 'subject', 'message'].forEach(function (id) {
        const f = getField(id);
        if (f) { f.value = ''; f.classList.remove('invalid'); }
        clearError(id);
    });

    // Auto-hide success message after 6 seconds
    setTimeout(function () {
        if (successBox) successBox.style.display = 'none';
    }, 6000);
}

// =============================================
//  SMOOTH SCROLL for anchor links
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const navHeight = navbar ? navbar.offsetHeight : 70;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    });
});
