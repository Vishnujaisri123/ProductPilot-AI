import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-[#1a1c23] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl"
      >
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-sm text-white/40 mt-2">Last updated: June 17, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-white/70 leading-relaxed">
          <p>
            At <strong>BestFinds Marketplace</strong>, accessible from <span className="text-[#ff9900]">product-pilot-ai-six.vercel.app</span>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by BestFinds and how we use it.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              We do not require users to register or provide personal information to browse the storefront. However, we collect standard log data and usage metrics:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60 ml-2">
              <li>IP addresses and browser user-agent strings.</li>
              <li>Pages visited and search queries made on our platform.</li>
              <li>Timestamp, date, and referral URLs of your visit.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Cookies and Web Beacons</h2>
            <p>
              Like any other website, BestFinds uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
            </p>
          </section>

          <section className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5">
            <h2 className="text-lg font-bold text-[#ff9900]">3. Affiliate Disclosure & Third-Party Privacy Policies</h2>
            <p>
              BestFinds is an affiliate marketing site. We participate in the Amazon Services LLC Associates Program and other merchant programs. 
            </p>
            <p className="mt-2 text-white/80">
              When you click on products links and buy buttons, you will be redirected to third-party e-commerce sites (e.g. Amazon, Flipkart). These third-party sites use cookies to track purchases for commission attribution. 
            </p>
            <p className="mt-2 text-white/50 text-xs">
              Note that BestFinds has no access to or control over these cookies that are used by third-party advertisers. Please consult the respective Privacy Policies of these third-party e-commerce platforms for more detailed information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. GDPR and CCPA Data Protection Rights</h2>
            <p>
              We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60 ml-2">
              <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Contact Us</h2>
            <p>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <span className="text-[#ff9900]">vishnuketa999@gmail.com</span>.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
