# Google Sheets Integration Setup

This guide will help you set up Google Sheets integration for saving form submissions and sending email notifications.

## Step 1: Create Google Sheet

1. Create a new Google Sheet
2. Add headers in Row 1:
   - `Name` | `Phone` | `Answers` | `Score` | `Level` | `Recovery Days` | `User ID` | `Timestamp`
3. Note the Sheet ID from URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## Step 2: Create Google Apps Script

1. In your Google Sheet, go to: **Extensions → Apps Script**
2. Delete any default code and paste the following script:

```javascript
// Test function - can be removed in production
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Google Apps Script is working. Use POST to submit data.',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Prepare row data
    const row = [
      data.name || '',
      data.phone || '',
      data.answers || '',
      data.score || 0,
      data.level || '',
      data.recoveryDays || 0,
      data.userId || '',
      new Date().toISOString()
    ];
    
    // Append row to sheet
    sheet.appendRow(row);
    
    // Send email notifications
    const emailBody = `
New Website Form Submission

Name: ${data.name}
Phone: ${data.phone}
Score: ${data.score} / 27
Level: ${data.level}
Recovery Days: ${data.recoveryDays}
User ID: ${data.userId || 'N/A'}

Answers:
${JSON.stringify(JSON.parse(data.answers || '{}'), null, 2)}

Timestamp: ${new Date().toISOString()}
    `;
    
    // Send to both email addresses
    MailApp.sendEmail({
      to: 'hello@guildup.club',
      subject: 'New Website Form submission',
      body: emailBody
    });
    
    MailApp.sendEmail({
      to: 'sales@guildup.club',
      subject: 'New Website Form submission',
      body: emailBody
    });
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved and emails sent'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Save** (Ctrl+S or Cmd+S)
4. Name your project (e.g., "Wellness Check Form Handler")

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
3. Configure:
   - **Description**: "Wellness Check Form Handler"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (important for public access)
4. Click **Deploy**
5. **Authorize** the script when prompted:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)"
   - Click "Allow"
6. Copy the **Web App URL** (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

## Step 4: Add Environment Variable

Add the Web App URL to your `.env.local` file:

```
NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Replace `YOUR_SCRIPT_ID` with the actual ID from your Web App URL.

## Step 5: Test

1. Complete the wellness check form
2. Verify that data appears in your Google Sheet
3. Check that emails are sent to hello@guildup.club and sales@guildup.club

## Troubleshooting

- **Permission errors**: Make sure "Who has access" is set to "Anyone"
- **Emails not sending**: Check that MailApp has permission (authorize when prompted)
- **Data not saving**: Check the Apps Script execution log (View → Execution log)
- **CORS errors**: The script uses `no-cors` mode, so responses won't be readable, but data will still be saved

## Notes

- The script sends emails to both hello@guildup.club and sales@guildup.club
- Email subject is: "New Website Form submission"
- Data is saved immediately when OTP is verified
- The script handles errors gracefully and won't block the user flow if it fails

