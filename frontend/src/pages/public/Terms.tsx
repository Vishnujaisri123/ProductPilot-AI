import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-[#1a1c23] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl"
      >
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
          <p className="text-sm text-white/40 mt-2">Last updated: June 17, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-white/70 leading-relaxed">
          <p>
            Welcome to <strong>BestFinds Marketplace</strong>! These terms and conditions outline the rules and regulations for the use of BestFinds' Website, located at <span className="text-[#ff9900]">product-pilot-ai-six.vercel.app</span>.
          </p>

          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use BestFinds if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Intellectual Property Rights</h2>
            <p>
              Other than the content you own, under these Terms, BestFinds and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Affiliate Disclaimer & Pricing</h2>
            <ul className="list-disc list-inside space-y-2 text-white/60 ml-2">
              <li>
                <strong>Third-party Sites:</strong> BestFinds displays curated product items and links to third-party marketplaces. We do not sell any items directly and do not collect payments for shopping carts.
              </li>
              <li>
                <strong>Commission:</strong> We earn a referral commission when you purchase items via our outbound affiliate links.
              </li>
              <li>
                <strong>Pricing changes:</strong> While we try to display the latest deal prices and discounts, prices on the destination marketplace (e.g. Amazon, Flipkart) govern the final checkout and are subject to change without notice.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Restrictions</h2>
            <p>You are specifically restricted from all of the following:</p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60 ml-2">
              <li>Publishing any Website material in any other media without prior consent.</li>
              <li>Selling, sublicensing, and/or otherwise commercializing any Website material.</li>
              <li>Using this Website in any way that is or may be damaging to this Website.</li>
              <li>Using this Website contrary to applicable laws and regulations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. No Warranties & Limitation of Liability</h2>
            <p>
              This Website is provided "as is," with all faults, and BestFinds expresses no representations or warranties of any kind related to this Website or the materials contained on this Website. 
            </p>
            <p className="mt-2">
              In no event shall BestFinds, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Governing Law & Jurisdiction</h2>
            <p>
              These Terms will be governed by and interpreted in accordance with the laws of the State, and you submit to the non-exclusive jurisdiction of the state and federal courts located in the State for the resolution of any disputes.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
