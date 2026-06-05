const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

const PLANS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

exports.createCheckout = async (req, res) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

  let customerId = req.user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: req.user.email, name: req.user.name });
    customerId = customer.id;
    await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PLANS[plan], quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard/billing`,
    metadata: { userId: req.user._id.toString(), plan },
  });

  res.json({ url: session.url });
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch { return res.status(400).send('Webhook error'); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await User.findByIdAndUpdate(session.metadata.userId, {
      plan: session.metadata.plan,
      stripeSubscriptionId: session.subscription,
      usageThisMonth: 0,
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    await User.findOneAndUpdate(
      { stripeSubscriptionId: event.data.object.id },
      { plan: 'free' }
    );
  }

  res.json({ received: true });
};

exports.getPortal = async (req, res) => {
  if (!req.user.stripeCustomerId) return res.status(400).json({ message: 'No billing account' });
  const session = await stripe.billingPortal.sessions.create({
    customer: req.user.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/dashboard/billing`,
  });
  res.json({ url: session.url });
};
