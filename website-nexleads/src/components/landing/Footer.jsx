import { useState } from "react";

const Footer = () => {
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  return (
    <>
      {/* FOOTER */}
      <footer className="border-t px-6 py-4 text-sm text-white bg-[#021024]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex gap-4">
            <button
              onClick={() => setOpenPrivacy(true)}
              className="hover:underline"
              type="button"
            >
              Privacy Policy
            </button>
<button
  type="button"
  onClick={() => setOpenTerms(true)}
  className="hover:underline"
>
  Terms & Conditions
</button>
          </div>

          <div>© 2026 NexLeads – All Rights Reserved</div>
        </div>
      </footer>

      {/* PRIVACY POLICY MODAL */}
      {openPrivacy && (
        <div
          className="fixed inset-0 z-100000 bg-black/60 flex items-center justify-center px-4"
          onClick={() => setOpenPrivacy(false)}
        >
          {/* Modal Box */}
          <div
            className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Privacy Policy</h2>
              <button
                type="button"
                onClick={() => setOpenPrivacy(false)}
                className="text-gray-500 hover:text-black"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 overflow-y-auto flex-1 text-sm text-gray-700 space-y-6 leading-relaxed">
              <div>
                <p className="font-semibold">Privacy Policy – NexLeads</p>
                <p className="text-xs text-gray-500">
                  Last Updated: [Add Date]
                </p>
              </div>

              <p>
                NexLeads (“we”, “our”, “us”) respects your privacy and is committed
                to protecting your personal data. This Privacy Policy explains
                how we collect, use, store, and protect your information when you
                use our platform.
              </p>

              <section>
                <h3 className="font-semibold mb-2">1. Information We Collect</h3>

                <p className="font-medium">a. Personal Information</p>
                <ul className="list-disc pl-5">
                  <li>Full name</li>
                  <li>Email address (including NexLeads-provided email)</li>
                  <li>Profile picture</li>
                  <li>Login credentials</li>
                  <li>Billing and subscription details</li>
                </ul>

                <p className="font-medium mt-3">b. Platform Usage Data</p>
                <ul className="list-disc pl-5">
                  <li>Emails sent, opened, and replied</li>
                  <li>Leads fetched from supported platforms</li>
                  <li>Follow-ups and project status</li>
                  <li>Login activity and IP address</li>
                  <li>Browser and device information</li>
                </ul>

                <p className="font-medium mt-3">c. Payment Information</p>
                <p>
                  Payments are processed through secure third-party payment
                  providers. NexLeads does not store your card details.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">
                  2. How We Use Your Information
                </h3>
                <ul className="list-disc pl-5">
                  <li>Create and manage your NexLeads account</li>
                  <li>Provide lead-fetching and email services</li>
                  <li>Enable follow-up tracking and project management</li>
                  <li>Improve platform performance and user experience</li>
                  <li>Communicate updates, alerts, or support messages</li>
                  <li>Process subscriptions and billing</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">3. Email Communication</h3>
                <ul className="list-disc pl-5">
                  <li>Used strictly for platform functionality</li>
                  <li>Stored securely for communication tracking</li>
                  <li>
                    Not accessed or shared without consent unless required by law
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">
                  4. Data Sharing & Third Parties
                </h3>
                <p>
                  We do not sell or rent your data. Limited data may be shared
                  with payment processors, email delivery services, and
                  analytics/security providers.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">5. Data Security</h3>
                <p>
                  We use encrypted storage, secure authentication, and access
                  controls. However, no system is 100% secure.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">6. Cookies & Tracking</h3>
                <p>
                  Cookies help keep you logged in, analyze usage, and improve
                  performance. Disabling cookies may affect functionality.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">7. Your Rights</h3>
                <ul className="list-disc pl-5">
                  <li>Access, update, or correct your data</li>
                  <li>Delete your account</li>
                  <li>Request data export</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-2">8. Account Deletion</h3>
                <p>
                  Account deletion permanently removes your data after a short
                  retention period. Active subscriptions must be canceled first.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">
                  9. Changes to Privacy Policy
                </h3>
                <p>
                  Continued use of NexLeads means you accept any updates to this
                  policy.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2">10. Contact Us</h3>
                <p>
                  📧 <a href="mailto:support@nexleads.com" className="underline">
                    support@nexleads.com
                  </a>
                </p>
              </section>
            </div>
            

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setOpenPrivacy(false)}
                className="px-5 py-2 rounded-xl bg-[#062D5E] text-white text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {openTerms && (
  <div
    className="fixed inset-0 z-100000 bg-black/60 flex items-center justify-center px-4"
    onClick={() => setOpenTerms(false)}
  >
    {/* Modal */}
    <div
      className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Terms & Conditions</h2>
        <button
          type="button"
          onClick={() => setOpenTerms(false)}
          className="text-gray-500 hover:text-black"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-5 overflow-y-auto flex-1 text-sm text-gray-700 space-y-6 leading-relaxed">
        <div>
          <p className="font-semibold">Terms & Conditions – NexLeads</p>
          <p className="text-xs text-gray-500">
            Last Updated: [Add Date]
          </p>
        </div>

        <p>
          By accessing or using NexLeads, you agree to these Terms &
          Conditions. If you do not agree, please do not use the platform.
        </p>

        <section>
          <h3 className="font-semibold mb-2">1. Eligibility</h3>
          <p>You must be at least 18 years old to use NexLeads.</p>
        </section>

        <section>
          <h3 className="font-semibold mb-2">2. Account Responsibility</h3>
          <ul className="list-disc pl-5">
            <li>Keep your login credentials secure</li>
            <li>All activity under your account is your responsibility</li>
            <li>One account per user unless permitted</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">3. Platform Usage</h3>
          <p className="mb-2">NexLeads allows users to:</p>
          <ul className="list-disc pl-5 mb-3">
            <li>Fetch leads from supported platforms</li>
            <li>Send emails and follow-ups</li>
            <li>Manage conversations and projects</li>
          </ul>

          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc pl-5">
            <li>Send spam or misleading emails</li>
            <li>Violate third-party platform terms</li>
            <li>Engage in illegal or fraudulent activity</li>
            <li>Abuse bulk email features</li>
          </ul>

          <p className="mt-2">
            Violations may result in suspension or termination.
          </p>
        </section>

        <section>
          <h3 className="font-semibold mb-2">4. Lead Responsibility</h3>
          <ul className="list-disc pl-5">
            <li>No guarantee of lead accuracy</li>
            <li>No responsibility for responses or conversions</li>
            <li>Acts only as a facilitation platform</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">
            5. Subscription Plans & Billing
          </h3>
          <ul className="list-disc pl-5">
            <li>Plans billed as shown on pricing page</li>
            <li>Lead limits apply per billing cycle</li>
            <li>No refunds for unused leads</li>
            <li>Pricing may change with notice</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">6. Email Limits & Fair Use</h3>
          <ul className="list-disc pl-5">
            <li>Bulk limits depend on your plan</li>
            <li>Abusive usage may trigger limits</li>
            <li>Accounts violating fair use may be restricted</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">7. Intellectual Property</h3>
          <p>
            All platform content, branding, and software belong to NexLeads.
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>No copying or resale</li>
            <li>No reverse engineering</li>
            <li>No unauthorized branding use</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">
            8. Account Suspension or Termination
          </h3>
          <ul className="list-disc pl-5">
            <li>Terms violations</li>
            <li>Spam or abuse detection</li>
            <li>Legal compliance issues</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">9. Limitation of Liability</h3>
          <ul className="list-disc pl-5">
            <li>Loss of income</li>
            <li>Missed leads</li>
            <li>Client disputes</li>
            <li>Downtime or third-party failures</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">10. Modifications</h3>
          <p>
            Continued use of NexLeads means acceptance of updates or
            modifications.
          </p>
        </section>

        <section>
          <h3 className="font-semibold mb-2">11. Governing Law</h3>
          <p>
            These terms are governed by applicable international digital
            service laws.
          </p>
        </section>

        <section>
          <h3 className="font-semibold mb-2">12. Contact Information</h3>
          <p>
            📧{" "}
            <a
              href="mailto:support@nexleads.com"
              className="underline"
            >
              support@nexleads.com
            </a>
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex justify-end">
        <button
          type="button"
          onClick={() => setOpenTerms(false)}
          className="px-5 py-2 rounded-xl bg-[#062D5E] text-white text-sm font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default Footer;

