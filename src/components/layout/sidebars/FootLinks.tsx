import Link from "next/link";
import { ShieldCheck, FileText, Mail, Phone } from "lucide-react";

const FooterLinks = () => {
  return (
    <div className="border-t border-gray-300 mt-6 pt-4 text-sm text-gray-600 text-center">
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/privacy-policy"
          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          target="_blank"
        >
          <ShieldCheck size={16} />
          Privacy Policy
        </Link>

        <span className="text-gray-400">|</span>

        <Link
          href="/terms-conditions"
          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          target="_blank"
        >
          <FileText size={16} />
          Terms & Conditions
        </Link>

        <span className="text-gray-400">|</span>

        <Link
          href="/contact-us"
          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          target="_blank"
        >
          <Mail size={16} />
          Contact Us
        </Link>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        &copy; 2025 GuildUp Communities Pvt Ltd <br />
        All rights reserved.
      </p>
    </div>
  );
};

export default FooterLinks;
