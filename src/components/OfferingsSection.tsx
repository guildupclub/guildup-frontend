import React, { useState } from 'react';
import { FiShare2, FiChevronDown, FiChevronUp, FiVideo, FiClock, FiDollarSign, FiCalendar, FiUserCheck } from 'react-icons/fi';

const offerings = [
  {
    category: 'Introductory & Clarity Sessions',
    items: [
      {
        title: 'Discovery Call',
        tagline: "Let's explore where you are and what support might help",
        badges: [
          { icon: <FiVideo />, label: '1:1 Online', highlight: false },
          { icon: <FiClock />, label: '20 min', highlight: false },
          { icon: <FiDollarSign />, label: 'Free', highlight: false },
          { icon: <FiCalendar />, label: 'Available Tomorrow', highlight: false },
          { icon: <FiUserCheck />, label: 'Most Welcoming', highlight: true },
        ],
        cta: 'Start Here',
        shareLink: '#discovery',
        promoted: true,
        details: [
          { q: "Who it's for", a: 'New visitors, unsure where to begin' },
          { q: 'Outcome', a: 'Understand if this space is the right fit' },
          { q: 'Format', a: 'Friendly video chat, no prep needed' },
          { q: 'Follow-up', a: 'Suggestions on how to move forward' },
          { q: 'Note', a: 'No pressure, no sales — just clarity' },
        ],
      },
    ],
  },
  {
    category: 'Ongoing Support Packages',
    items: [
      {
        title: '1-Month Foundation Plan',
        tagline: 'Start building a consistent practice',
        badges: [
          { icon: <FiCalendar />, label: '4 sessions · Weekly', highlight: false },
          { icon: <FiDollarSign />, label: '₹X', highlight: false },
          { icon: <FiVideo />, label: 'Online', highlight: false },
        ],
        cta: 'Build Your Rhythm',
        shareLink: '#foundation',
        promoted: false,
        details: [
          { q: "Who it's for", a: 'Beginners or returners' },
          { q: 'Results', a: 'A weekly anchor to reset, reconnect, and grow' },
          { q: 'Format', a: '1:1 sessions + shared check-in doc' },
          { q: 'Includes', a: 'Progress tracking + simple home practice' },
          { q: 'Follow-up', a: 'Voice/text support between sessions (optional)' },
        ],
      },
      {
        title: '3-Month Growth Plan',
        tagline: 'Build resilience, routine, and deeper alignment',
        badges: [
          { icon: <FiCalendar />, label: '12 sessions · 3 months', highlight: false },
          { icon: <FiDollarSign />, label: '₹Y', highlight: false },
          { icon: <FiUserCheck />, label: 'Best Value', highlight: true },
        ],
        cta: 'Commit to Growth',
        shareLink: '#growth',
        promoted: false,
        details: [
          { q: "Who it's for", a: 'Those ready to commit and grow long-term' },
          { q: 'Results', a: 'A consistent shift in habits, energy, and mindset' },
          { q: 'Format', a: 'Bi-weekly or weekly 1:1 sessions + digital support' },
          { q: 'Includes', a: 'Journaling prompts, recorded flows, Q&A voice notes' },
          { q: 'Add-on', a: 'Optional 15-min midpoint reflection call' },
        ],
      },
      {
        title: '1:1 Ongoing Support (Pay Monthly)',
        tagline: 'Personalized practice & check-ins, on your schedule',
        badges: [
          { icon: <FiCalendar />, label: 'Flexible frequency', highlight: false },
          { icon: <FiDollarSign />, label: '₹Monthly', highlight: false },
        ],
        cta: 'Stay Supported',
        shareLink: '#ongoing',
        promoted: false,
        details: [
          { q: "Who it's for", a: 'Returning or long-term clients' },
          { q: 'Results', a: 'Accountability, expert support without burnout' },
          { q: 'Format', a: 'Live calls + async voice notes' },
          { q: 'Includes', a: 'Access to private content or live class library' },
        ],
      },
    ],
  },
  {
    category: 'Live Class Schedules',
    items: [
      {
        title: 'Weekday Morning Flow',
        tagline: 'Start your day grounded & energized',
        badges: [
          { icon: <FiCalendar />, label: 'Tues/Thurs · 7:30 AM', highlight: false },
          { icon: <FiDollarSign />, label: '₹200/class', highlight: false },
        ],
        cta: 'Join Next Class',
        shareLink: '#weekday',
        promoted: false,
        details: [
          { q: 'Format', a: 'Zoom group class (30–40 mins)' },
          { q: 'Focus', a: 'Breathwork, energizing asanas' },
          { q: 'Includes', a: 'Replay for 48 hours (optional)' },
        ],
      },
      {
        title: 'Weekend Reset Practice',
        tagline: 'Unwind, release, and return to center',
        badges: [
          { icon: <FiCalendar />, label: 'Sat · 10:00 AM', highlight: false },
          { icon: <FiDollarSign />, label: '₹200/class', highlight: false },
        ],
        cta: 'Reserve My Spot',
        shareLink: '#weekend',
        promoted: false,
        details: [
          { q: 'Format', a: 'Longer restorative flow' },
          { q: 'Focus', a: 'Breath, deep stretches, stillness' },
          { q: 'Includes', a: 'Community journaling prompt' },
        ],
      },
    ],
  },
  {
    category: 'Custom Need / Personalized Path',
    items: [
      {
        title: 'Not Sure What You Need? Let\'s Talk',
        tagline: 'Every journey is unique. Let\'s co-create yours together.',
        badges: [
          { icon: <FiDollarSign />, label: 'Free or ₹100', highlight: false },
          { icon: <FiClock />, label: '15–20 min Call', highlight: false },
        ],
        cta: 'Talk to Me',
        shareLink: '#custom',
        promoted: false,
        details: [
          { q: 'What to Expect', a: 'A no-pressure space to share what\'s on your mind — whether it\'s stress, disconnection, or a goal you\'re unsure how to reach.' },
          { q: 'What You\'ll Leave With', a: 'A personalized suggestion on where to begin — or just a deeper breath.' },
        ],
      },
    ],
  },
];

const microcopy = [
  'Instant confirmation · No obligation',
  'Your pace. Your space. No push.',
  'Support that fits your energy, not your calendar.'
];

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

const OfferingsSection: React.FC = () => {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="mt-10">
      {offerings.map((group) => (
        <div key={group.category} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 ml-2">{group.category}</h2>
          <div className="flex flex-col gap-6">
            {group.items.map((item, idx) => {
              const cardKey = `${group.category}-${item.title}`;
              return (
                <div
                  key={item.title}
                  className={`relative bg-white rounded-2xl border transition-all duration-300 p-8 mb-2
                    ${item.promoted ? 'border-indigo-300 shadow-lg ring-2 ring-indigo-200' : 'border-blue-100 shadow-md'}
                    hover:shadow-xl hover:-translate-y-1`}
                >
                  {/* Share Icon */}
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 active:text-indigo-800 focus:outline-none"
                    onClick={() => copyToClipboard(window.location.href + item.shareLink)}
                    title="Share with a friend"
                  >
                    <FiShare2 size={22} />
                  </button>
                  {/* Title & Tagline */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                      <div className="italic text-gray-500 mb-2 text-base">{item.tagline}</div>
                    </div>
                  </div>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {item.badges.map((badge, i) => (
                      <span
                        key={i}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide
                          ${badge.highlight ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-50 text-blue-700'}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    ))}
                  </div>
                  {/* CTA Button */}
                  <div className="flex justify-end mb-4">
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-colors duration-200">
                      {item.cta}
                    </button>
                  </div>
                  {/* Accordion Dropdown */}
                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <button
                      className="flex items-center gap-2 text-indigo-600 font-semibold mb-2 focus:outline-none"
                      onClick={() => toggle(cardKey)}
                    >
                      What to Expect
                      {open[cardKey] ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    <div className={`transition-all duration-300 ${open[cardKey] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <ul className="pl-1 text-gray-700 text-sm space-y-2">
                        {item.details.map((d, i) => (
                          <li key={i}>
                            <span className="font-semibold text-gray-800">{d.q}:</span> {d.a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {/* Microcopy Footer */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs text-gray-400">
        {microcopy.map((m, i) => (
          <span key={i} className="bg-gray-50 px-3 py-1 rounded-full">{m}</span>
        ))}
      </div>
    </section>
  );
};

export default OfferingsSection; 