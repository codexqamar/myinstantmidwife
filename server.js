const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const express = require('express');
const Stripe = require('stripe');

const app = express();
const port = process.env.PORT || 3000;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID || '724bee86b3';
const mailchimpServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX || (mailchimpApiKey && mailchimpApiKey.includes('-')
    ? mailchimpApiKey.split('-').pop()
    : 'us17');
const stripe = stripeSecretKey && !stripeSecretKey.includes('your_secret_key_here')
    ? Stripe(stripeSecretKey)
    : null;

const courses = {
    biomechanics: {
        title: 'Biomechanics in Labour',
        amount: 1999,
        currency: 'gbp',
        fileName: 'MIM-Biomechanics-in-Labour.pdf',
        downloadName: 'MIM_Biomechanics_in_Labour.pdf'
    },
    babymoon: {
        title: 'The Baby Moon',
        amount: 1999,
        currency: 'gbp',
        fileName: 'MIM-Baby-Moon-40-Days.pdf',
        downloadName: 'MIM_Baby_Moon_40_Days.pdf'
    },
    hypnobirthing: {
        title: 'Hypnobirthing',
        amount: 1999,
        currency: 'gbp',
        fileName: 'MIM-Hypnobirthing-Course.pdf',
        downloadName: 'MIM_Hypnobirthing_Course.pdf'
    }
};

const downloadTokens = new Map();
const tokenTtlMs = 30 * 60 * 1000;

const subscriptionPlans = {
    core: {
        title: 'MIM Core Support',
        priceLabel: 'GBP 79.99/month',
        priceId: process.env.STRIPE_CORE_PRICE_ID,
        amount: 7999,
        currency: 'gbp',
        interval: 'month',
        tags: ['subscriber', 'plan-core-support']
    },
    signature: {
        title: 'MIM Signature Support',
        priceLabel: 'GBP 149.99/month',
        priceId: process.env.STRIPE_SIGNATURE_PRICE_ID,
        amount: 14999,
        currency: 'gbp',
        interval: 'month',
        tags: ['subscriber', 'plan-signature-support']
    },
    sustained: {
        title: 'MIM Sustained Support',
        priceLabel: 'GBP 1,399 one payment',
        amount: 139900,
        currency: 'gbp',
        tags: ['subscriber', 'plan-sustained-support']
    }
};

const dashboardContentPath = path.join(__dirname, 'dashboard', 'data', 'content.json');

function readDashboardContent() {
    try {
        return JSON.parse(fs.readFileSync(dashboardContentPath, 'utf8'));
    } catch (error) {
        return null;
    }
}

function parseGbpAmount(price) {
    const numeric = String(price || '').replace(/[^0-9.]/g, '');
    if (!numeric) return null;
    const amount = Math.round(Number(numeric) * 100);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function applyManagedCourse(courseId, course) {
    const managed = readDashboardContent();
    const managedCourse = managed && Array.isArray(managed.courses)
        ? managed.courses.find(item => item.id === courseId)
        : null;
    if (!managedCourse) return course;

    const amount = parseGbpAmount(managedCourse.price);
    return {
        ...course,
        title: managedCourse.title || course.title,
        amount: amount || course.amount
    };
}

function applyManagedPlan(planId, plan) {
    const managed = readDashboardContent();
    const managedPlan = managed && Array.isArray(managed.packages)
        ? managed.packages.find(item => item.id === planId)
        : null;
    if (!managedPlan) return plan;

    const amount = parseGbpAmount(managedPlan.price);
    const priceLabel = [managedPlan.price, managedPlan.period].filter(Boolean).join(' ');
    return {
        ...plan,
        title: managedPlan.title || plan.title,
        priceLabel: priceLabel || plan.priceLabel,
        amount: amount || plan.amount
    };
}

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe || !stripeWebhookSecret) {
        res.status(500).send('Stripe webhook is not configured.');
        return;
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], stripeWebhookSecret);
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
        return;
    }

    try {
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object;
            const subscriptionId = invoice.subscription;
            if (subscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                await sendSubscriptionCustomerToMailchimp(subscription.metadata || {});
            }
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            if (paymentIntent.metadata && paymentIntent.metadata.source) {
                await sendPaymentIntentCustomerToMailchimp(paymentIntent.metadata || {});
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing failed:', error);
        res.status(500).send('Webhook processing failed.');
    }
});

app.use(express.json());
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/pdf', (req, res) => {
    res.status(403).send('PDF downloads require a successful payment.');
});

const pageRoutes = {
    '/about': 'about.html',
    '/courses': 'courses.html',
    '/faq': 'faq.html',
    '/contact': 'contact.html',
    '/subscription': 'subscription.html',
    '/testimonials': 'testimonials.html',
    '/privacy-policy': 'privacy-policy.html',
    '/terms-conditions': 'terms-conditions.html'
};

app.get('/index.html', (req, res) => {
    res.redirect(301, '/');
});

app.get('/pages/:page.html', (req, res, next) => {
    const cleanPath = `/${req.params.page}`;
    if (pageRoutes[cleanPath]) {
        res.redirect(301, cleanPath);
        return;
    }
    next();
});

app.get('/:page.html', (req, res, next) => {
    const cleanPath = `/${req.params.page}`;
    if (pageRoutes[cleanPath]) {
        res.redirect(301, cleanPath);
        return;
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

Object.entries(pageRoutes).forEach(([route, fileName]) => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, 'pages', fileName));
    });
});

function getCourseOrSendError(courseId, res) {
    const course = courses[courseId];
    if (!course) {
        res.status(400).json({ error: 'Invalid course selected.' });
        return null;
    }
    return applyManagedCourse(courseId, course);
}

function requireStripe(res) {
    if (!stripe || !stripePublishableKey || stripePublishableKey.includes('your_publishable_key_here')) {
        res.status(500).json({ error: 'Stripe is not configured. Add sandbox keys to .env and restart the server.' });
        return false;
    }
    return true;
}

function clearExpiredTokens() {
    const now = Date.now();
    for (const [token, details] of downloadTokens.entries()) {
        if (details.expiresAt <= now) downloadTokens.delete(token);
    }
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function requireMailchimp(res) {
    if (!mailchimpApiKey || !mailchimpAudienceId || !mailchimpServerPrefix) {
        res.status(500).json({ error: 'Mailchimp is not configured. Add MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, and MAILCHIMP_SERVER_PREFIX to .env.' });
        return false;
    }
    return true;
}

async function mailchimpRequest(endpoint, options = {}) {
    if (!mailchimpApiKey || !mailchimpAudienceId || !mailchimpServerPrefix) {
        throw new Error('Mailchimp is not configured.');
    }

    const response = await fetch(`https://${mailchimpServerPrefix}.api.mailchimp.com/3.0${endpoint}`, {
        ...options,
        headers: {
            Authorization: `Basic ${Buffer.from(`anystring:${mailchimpApiKey}`).toString('base64')}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
        throw new Error(data.detail || data.title || 'Mailchimp request failed.');
    }
    return data;
}

async function addMailchimpNote(email, note) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail || !note) return;

    const subscriberHash = crypto.createHash('md5').update(cleanEmail).digest('hex');
    await mailchimpRequest(`/lists/${mailchimpAudienceId}/members/${subscriberHash}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: String(note).slice(0, 1000) })
    });
}

async function upsertMailchimpMember({ email, firstName, lastName, phone, tags = [], note }) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) throw new Error('Email address is required.');

    const subscriberHash = crypto.createHash('md5').update(cleanEmail).digest('hex');
    const mergeFields = {
        FNAME: String(firstName || '').trim(),
        LNAME: String(lastName || '').trim()
    };

    await mailchimpRequest(`/lists/${mailchimpAudienceId}/members/${subscriberHash}`, {
        method: 'PUT',
        body: JSON.stringify({
            email_address: cleanEmail,
            status_if_new: 'subscribed',
            status: 'subscribed',
            merge_fields: mergeFields
        })
    });

    const activeTags = [...new Set(tags.filter(Boolean))].map(name => ({ name, status: 'active' }));
    if (activeTags.length) {
        await mailchimpRequest(`/lists/${mailchimpAudienceId}/members/${subscriberHash}/tags`, {
            method: 'POST',
            body: JSON.stringify({ tags: activeTags })
        });
    }

    if (note) {
        try {
            await addMailchimpNote(cleanEmail, note);
        } catch (error) {
            console.error('Unable to add Mailchimp note:', error.message);
        }
    }

    return {
        email: cleanEmail,
        tags: activeTags.map(tag => tag.name)
    };
}

function contactNote(form) {
    return [
        `Source: contact form`,
        `Phone: ${form.phone || ''}`,
        `Address: ${form.addressLine1 || ''}`,
        `Town/City: ${form.city || ''}`,
        `Post Code: ${form.postCode || ''}`,
        `Due Date: ${form.dueDate || ''}`,
        `Interested In: ${form.serviceInterest || ''}`,
        `Preferred Contact: ${form.contactPreference || ''}`,
        `Best Time: ${form.bestTime || ''}`,
        `Heard About Us: ${form.heardAbout || ''}`,
        `Comments: ${form.comments || ''}`
    ].join('\n');
}

async function sendSubscriptionCustomerToMailchimp(metadata) {
    if (!metadata.customerEmail) {
        throw new Error('Subscription customer email is missing from Stripe metadata.');
    }

    const plan = subscriptionPlans[metadata.planId];
    return upsertMailchimpMember({
        email: metadata.customerEmail,
        firstName: metadata.firstName,
        lastName: metadata.lastName,
        phone: metadata.phone,
        tags: plan ? plan.tags : ['subscriber'],
        note: `Source: paid subscription\nPlan: ${metadata.planTitle || (plan && plan.title) || ''}\nStripe Customer: ${metadata.stripeCustomerId || ''}`
    });
}

async function sendPaymentIntentCustomerToMailchimp(metadata) {
    if (!metadata.customerEmail) {
        throw new Error('Customer email is missing from Stripe metadata.');
    }

    if (metadata.source === 'subscription') {
        await sendSubscriptionCustomerToMailchimp(metadata);
        return;
    }

    if (metadata.source === 'pdf') {
        return upsertMailchimpMember({
            email: metadata.customerEmail,
            firstName: metadata.firstName,
            lastName: metadata.lastName,
            tags: ['pdf-customer', metadata.courseId ? `course-${metadata.courseId}` : ''],
            note: `Source: PDF payment\nCourse: ${metadata.courseTitle || ''}`
        });
    }

    throw new Error(`Unsupported customer event source: ${metadata.source || 'missing'}.`);
}

function getSubscriptionPlanOrSendError(planId, res) {
    const plan = subscriptionPlans[planId];
    if (!plan) {
        res.status(400).json({ error: 'Invalid subscription plan selected.' });
        return null;
    }
    return applyManagedPlan(planId, plan);
}

function formatCustomerName(customer = {}) {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
}

app.get('/api/stripe-config', (req, res) => {
    if (!stripePublishableKey || stripePublishableKey.includes('your_publishable_key_here')) {
        res.status(500).json({ error: 'Stripe publishable key is not configured.' });
        return;
    }

    res.json({ publishableKey: stripePublishableKey });
});

app.post('/api/create-payment-intent', async (req, res) => {
    if (!requireStripe(res)) return;

    const { courseId, customer } = req.body || {};
    const course = getCourseOrSendError(courseId, res);
    if (!course) return;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: course.amount,
            currency: course.currency,
            description: `My Instant Midwife - ${course.title} PDF`,
            automatic_payment_methods: { enabled: true },
            metadata: {
                courseId,
                courseTitle: course.title,
                service: `${course.title} PDF Download`,
                source: 'pdf',
                customerEmail: normalizeEmail(customer && customer.email),
                firstName: customer && customer.firstName ? customer.firstName : '',
                lastName: customer && customer.lastName ? customer.lastName : ''
            },
            receipt_email: customer && customer.email ? customer.email : undefined
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to start payment.' });
    }
});

app.post('/api/contact-request', async (req, res) => {
    if (!requireMailchimp(res)) return;

    const form = req.body || {};
    const requiredFields = ['firstName', 'lastName', 'email', 'addressLine1', 'city', 'postCode', 'dueDate', 'serviceInterest', 'contactPreference', 'bestTime', 'heardAbout'];
    const missingField = requiredFields.find(field => !String(form[field] || '').trim());
    if (missingField) {
        res.status(400).json({ error: 'Please complete all required fields.' });
        return;
    }

    if (!form.consent) {
        res.status(400).json({ error: 'Please confirm consent before submitting.' });
        return;
    }

    try {
        await upsertMailchimpMember({
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            tags: ['contact-form'],
            note: contactNote(form)
        });

        res.json({ message: 'Thank you. Your request has been received and we will contact you soon.' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to submit your request.' });
    }
});

app.post('/api/create-subscription-payment', async (req, res) => {
    if (!requireStripe(res)) return;

    const { planId, customer } = req.body || {};
    const plan = getSubscriptionPlanOrSendError(planId, res);
    if (!plan) return;

    const email = normalizeEmail(customer && customer.email);
    if (!email || !customer.firstName || !customer.lastName || !customer.address) {
        res.status(400).json({ error: 'Please fill in all required customer details.' });
        return;
    }

    try {
        const stripeCustomer = await stripe.customers.create({
            email,
            name: formatCustomerName(customer),
            phone: customer.phone || undefined,
            address: {
                line1: customer.address
            },
            metadata: {
                planId,
                source: 'subscription'
            }
        });

        const metadata = {
            source: 'subscription',
            planId,
            planTitle: plan.title,
            customerEmail: email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone || '',
            stripeCustomerId: stripeCustomer.id
        };

        if (plan.interval) {
            const product = plan.priceId
                ? null
                : await stripe.products.create({
                    name: plan.title,
                    metadata: {
                        planId,
                        source: 'subscription'
                    }
                });

            const subscriptionItem = plan.priceId
                ? { price: plan.priceId }
                : {
                    price_data: {
                        currency: plan.currency,
                        unit_amount: plan.amount,
                        recurring: { interval: plan.interval },
                        product: product.id
                    }
                };

            const subscription = await stripe.subscriptions.create({
                customer: stripeCustomer.id,
                items: [subscriptionItem],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
                metadata
            });

            const paymentIntent = subscription.latest_invoice && subscription.latest_invoice.payment_intent;
            if (!paymentIntent || !paymentIntent.client_secret) {
                throw new Error('Unable to start the subscription payment.');
            }

            res.json({
                mode: 'subscription',
                clientSecret: paymentIntent.client_secret,
                subscriptionId: subscription.id,
                paymentIntentId: paymentIntent.id
            });
            return;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: plan.amount,
            currency: plan.currency,
            customer: stripeCustomer.id,
            description: `My Instant Midwife - ${plan.title}`,
            automatic_payment_methods: { enabled: true },
            receipt_email: email,
            metadata
        });

        res.json({
            mode: 'payment',
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to start subscription payment.' });
    }
});

app.post('/api/confirm-customer-event', async (req, res) => {
    if (!requireStripe(res)) return;
    if (!requireMailchimp(res)) return;

    const { paymentIntentId, subscriptionId } = req.body || {};
    if (!paymentIntentId && !subscriptionId) {
        res.status(400).json({ error: 'Payment confirmation is missing.' });
        return;
    }

    try {
        if (paymentIntentId && subscriptionId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                res.status(402).json({ error: 'Payment was not successful.' });
                return;
            }

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const mailchimp = await sendSubscriptionCustomerToMailchimp(subscription.metadata || {});
            res.json({ message: 'Customer email journey has been triggered.', mailchimp });
            return;
        }

        if (paymentIntentId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                res.status(402).json({ error: 'Payment was not successful.' });
                return;
            }

            const mailchimp = await sendPaymentIntentCustomerToMailchimp(paymentIntent.metadata || {});
            res.json({ message: 'Customer email journey has been triggered.', mailchimp });
            return;
        }
    } catch (error) {
        console.error('Unable to trigger customer email:', error);
        res.status(500).json({ error: error.message || 'Unable to trigger customer email.' });
    }
});

app.post('/api/create-download-token', async (req, res) => {
    if (!requireStripe(res)) return;

    const { paymentIntentId } = req.body || {};
    if (!paymentIntentId) {
        res.status(400).json({ error: 'Payment confirmation is missing.' });
        return;
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const courseId = paymentIntent.metadata && paymentIntent.metadata.courseId;
        const course = getCourseOrSendError(courseId, res);
        if (!course) return;

        if (paymentIntent.status !== 'succeeded') {
            res.status(402).json({ error: 'Payment was not successful.' });
            return;
        }

        clearExpiredTokens();

        const token = crypto.randomBytes(32).toString('hex');
        downloadTokens.set(token, {
            courseId,
            expiresAt: Date.now() + tokenTtlMs
        });

        const mailchimp = await sendPaymentIntentCustomerToMailchimp(paymentIntent.metadata || {});

        res.json({
            downloadUrl: `/api/download/${token}`,
            downloadName: course.downloadName,
            mailchimp
        });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to verify payment.' });
    }
});

app.get('/api/download/:token', (req, res) => {
    clearExpiredTokens();

    const tokenDetails = downloadTokens.get(req.params.token);
    if (!tokenDetails) {
        res.status(403).send('This download link is invalid or has expired.');
        return;
    }

    const course = courses[tokenDetails.courseId];
    if (!course) {
        res.status(404).send('Course file not found.');
        return;
    }

    const pdfPath = path.join(__dirname, 'pdf', course.fileName);
    res.download(pdfPath, course.downloadName);
});

app.listen(port, () => {
    console.log(`My Instant Midwife is running at http://localhost:${port}`);
});
