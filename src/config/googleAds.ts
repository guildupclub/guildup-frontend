export type GoogleAdsConversion = {
	conversionId: string; // e.g., "AW-123456789"
	conversionLabel: string; // e.g., "ABC123DEF456"
	defaultValue?: number;
};

// Fill this with your campaigns' conversion IDs and labels from Google Ads
export const GOOGLE_ADS_CONVERSIONS: Record<string, GoogleAdsConversion> = {
	// signup: { conversionId: "AW-XXXX", conversionLabel: "YYYY" },
	// lead: { conversionId: "AW-XXXX", conversionLabel: "ZZZZ" },
	// purchase: { conversionId: "AW-XXXX", conversionLabel: "TTTT", defaultValue: 0 },
};
