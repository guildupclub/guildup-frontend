import Link from "next/link";
import { ShieldCheck, FileText, Mail } from "lucide-react";

const FooterLinks = () => {
  return (
    <div className="mt-4 text-xs">
      {/* Links Section */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2">
          <Link
            href="/privacy-policy"
            className="flex items-center gap-2 p-1.5 rounded-lg transition-colors group"
            target="_blank"
          >
            <ShieldCheck size={14} className="text-gray-400 group-hover:text-gray-600" />
            <span className="text-gray-400 group-hover:text-gray-600">
              Privacy Policy
            </span>
          </Link>

          <Link
            href="/terms-conditions"
            className="flex items-center gap-2 p-1.5 rounded-lg transition-colors group"
            target="_blank"
          >
            <FileText size={14} className="text-gray-400 group-hover:text-gray-600" />
            <span className="text-gray-400 group-hover:text-gray-600">
              Terms & Conditions
            </span>
          </Link>

          <Link
            href="/contact-us"
            className="flex items-center gap-2 p-1.5 rounded-lg transition-colors group"
            target="_blank"
          >
            <Mail size={14} className="text-gray-400 group-hover:text-gray-600" />
            <span className="text-gray-400 group-hover:text-gray-600">
              Contact Us
            </span>
          </Link>
        </div>

        {/* Copyright Section */}
        <div className="pt-2 text-center">
          <p className="text-[10px] text-gray-400">
            © 2025 GuildUp Communities
          </p>
        </div>
      </div>
    </div>
  );
};

export default FooterLinks;
