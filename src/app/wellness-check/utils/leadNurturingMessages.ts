/**
 * Lead nurturing messages to show between questions
 * These messages rotate randomly to motivate users towards booking the Clarity Call
 */

export const LEAD_NURTURING_MESSAGES = [
  "Over 2,500 people have found relief from anxiety and depression through our proven framework",
  "In just one 40-minute clarity call, you'll discover the root cause of your symptoms and get a personalized recovery plan",
  "Most people see 50-70% improvement in their symptoms within the first 30 days of working with us",
  "Our framework has helped people reduce their recovery time from 6 months to just 3-12 weeks, based on their assessment score",
  "The clarity call alone has helped hundreds understand why therapy and medication didn't work - and what will actually fix it",
  "You'll leave the call with a clear roadmap to reset your nervous system and feel calm, stable, and in control again",
  "Our clients often say the clarity call was the turning point - finally understanding what's really causing their symptoms",
  "The GuildUp framework addresses the root cause (nervous system) rather than just managing symptoms, which is why it works so fast",
];

/**
 * Get a random lead nurturing message
 * @returns A random message from the list
 */
export function getRandomLeadNurturingMessage(): string {
  const randomIndex = Math.floor(Math.random() * LEAD_NURTURING_MESSAGES.length);
  return LEAD_NURTURING_MESSAGES[randomIndex];
}

