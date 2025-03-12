import Link from 'next/link';
import { Phone } from 'lucide-react';

const FooterLinks = () => {
  return (
    <div className="text-sm text-gray-500 pr-4"> 
      <Link href="/privacy-policy" className="hover:underline" target='_blank'>
        Privacy Policy
      </Link>
      {' | '} {/* Separator */}
      <Link href="/terms-conditions" className="hover:underline" target='_blank'>
        Terms and Conditions
      </Link>
      {' | '} {/* Separator */}
      <Link href="/contact-us" className="hover:underline" target='_blank'>
        Contact Us
      </Link>
      <p className="mt-2 text-xs pr-4">
        GuildUp Communities Pvt Ltd @2025 <br/>
        All rights reserved.
      </p>
    </div>
  );
};

export default FooterLinks;