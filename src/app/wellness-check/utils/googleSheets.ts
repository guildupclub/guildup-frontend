/**
 * Google Sheets integration for saving form submissions
 * Uses Google Apps Script Web App endpoint
 */

export interface FormSubmissionData {
  name: string;
  phone: string;
  answers: Record<string, string>;
  score: number;
  level: string;
  recoveryDays: number;
  userId?: string;
  timestamp: string;
}

// College leads → Google Sheets
export interface CollegeLeadSubmission {
  name: string;
  email: string;
  phone: string;
  institutionName: string;
  role?: string;
  studentCount?: string;
  message?: string;
  source?: string;
  timestamp: string;
}

/**
 * Save form data to Google Sheets via Google Apps Script Web App
 * Also sends email notification to hello@guildup.club and sales@guildup.club
 */
export async function saveToGoogleSheets(data: FormSubmissionData): Promise<void> {
  const webAppUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL;

  if (!webAppUrl) {
    console.warn("Google Sheets Web App URL not configured. Skipping save.");
    return;
  }

  try {
    // Format answers as JSON string for the sheet
    const answersJson = JSON.stringify(data.answers);

    // Prepare the payload
    const payload = {
      name: data.name,
      phone: data.phone,
      answers: answersJson,
      score: data.score,
      level: data.level,
      recoveryDays: data.recoveryDays,
      userId: data.userId || "",
      timestamp: data.timestamp,
    };

    // Send to Google Apps Script Web App
    const response = await fetch(webAppUrl, {
      method: "POST",
      mode: "no-cors", // Google Apps Script requires no-cors for public web apps
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Note: With no-cors mode, we can't read the response
    // But the request will be sent successfully
    console.log("Form data sent to Google Sheets:", payload);
  } catch (error) {
    console.error("Error saving to Google Sheets:", error);
    // Don't throw - we don't want to block the user flow if this fails
  }
}

/**
 * Save college lead data to Google Sheets via a dedicated Google Apps Script Web App.
 * The Apps Script can also send an email notification to hello@guildup.club for every submission.
 */
export async function saveCollegeLeadToGoogleSheets(data: CollegeLeadSubmission): Promise<void> {
  const webAppUrl =
    process.env.NEXT_PUBLIC_COLLEGE_LEADS_WEB_APP_URL ||
    "https://script.google.com/macros/s/AKfycbzgry0fCbOnFH4s0UdGk7flIhZ_RXZc9TwQTUMnixUHN7YBL9QHDNgG1bkwL2fwT9VY/exec";

  if (!webAppUrl) {
    console.warn("College leads Google Sheets Web App URL not configured. Skipping save.");
    return;
  }

  try {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      institutionName: data.institutionName,
      role: data.role || "",
      studentCount: data.studentCount || "",
      message: data.message || "",
      source: data.source || "",
      timestamp: data.timestamp,
    };

    await fetch(webAppUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("College lead sent to Google Sheets:", payload);
  } catch (error) {
    console.error("Error saving college lead to Google Sheets:", error);
    // Do not throw – we do not want to block the user flow if this fails
  }
}

/**
 * Send email notification with form submission data
 * This is handled by the Google Apps Script, but we include it here for reference
 */
export async function sendEmailNotification(data: FormSubmissionData): Promise<void> {
  // Email sending is handled by Google Apps Script
  // The script will send emails to hello@guildup.club and sales@guildup.club
  // with subject "New Website Form submission"
  // This function is here for reference/documentation
  console.log("Email notification will be sent by Google Apps Script");
}


