import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Webhook endpoint for Notion native webhooks
 * 
 * This endpoint receives webhook events directly from Notion when pages or databases change.
 * 
 * Webhook URL: https://dev.guildup.club/api/webhooks/notion
 * 
 * Setup: https://developers.notion.com/reference/webhooks
 * 
 * Supported Notion event types:
 * - page.content_updated
 * - page.created
 * - page.locked
 * - comment.created
 * - data_source.schema_updated
 * - database.schema_updated (deprecated)
 * 
 * Notion webhook payload format:
 * {
 *   "verification_token": "...", // Only during verification
 *   "event_type": "page.content_updated",
 *   "entity": {
 *     "id": "page-id",
 *     "type": "page"
 *   },
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get Notion signature from headers
    const notionSignature = request.headers.get('x-notion-signature');
    
    // Get verification token from environment (stored from initial verification)
    const verificationToken = process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN;
    
    // Parse webhook payload
    const rawBody = await request.text();
    let body: any;
    
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON payload',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }
    
    // Handle webhook verification (Step 2 of Notion webhook setup)
    if (body.verification_token) {
      console.log('Notion webhook verification request received');
      
      // Store the verification token (you should save this to your environment)
      // For now, we'll log it so you can add it to Vercel environment variables
      console.log('VERIFICATION_TOKEN:', body.verification_token);
      console.log('⚠️  IMPORTANT: Add this to your Vercel environment variables as NOTION_WEBHOOK_VERIFICATION_TOKEN');
      
      // Return success to acknowledge receipt
      return NextResponse.json({
        success: true,
        message: 'Verification token received. Please add NOTION_WEBHOOK_VERIFICATION_TOKEN to your environment variables.',
        verification_token: body.verification_token
      });
    }
    
    // Validate Notion webhook signature (Step 3 of Notion webhook setup)
    if (verificationToken && notionSignature) {
      const isValid = verifyNotionWebhookSignature(rawBody, notionSignature, verificationToken);
      
      if (!isValid) {
        console.warn('Invalid Notion webhook signature', {
          timestamp: new Date().toISOString(),
          hasSignature: !!notionSignature
        });
        
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid webhook signature',
            message: 'Notion webhook signature verification failed'
          },
          { status: 401 }
        );
      }
    } else if (verificationToken && !notionSignature) {
      console.warn('Verification token configured but no signature header received');
    }
    
    // Extract event information from Notion webhook format
    const eventType = body.event_type || body.type || 'unknown';
    const entity = body.entity || {};
    const entityId = entity.id;
    const entityType = entity.type;
    
    console.log('Notion webhook received:', {
      eventType,
      entityType,
      entityId: entityId || 'N/A',
      timestamp: body.timestamp || new Date().toISOString()
    });
    
    // Handle different Notion event types
    switch (eventType) {
      case 'page.content_updated':
      case 'page.created':
        // Revalidate all blog pages
        revalidatePath('/blogs');
        revalidatePath('/blogs/[slug]', 'page');
        revalidateTag('blogs');
        
        // If we have the page ID, we could fetch the slug and revalidate that specific page
        // For now, we'll revalidate all pages to ensure updates are reflected
        if (entityId) {
          console.log(`Revalidating pages after ${eventType} for entity: ${entityId}`);
        }
        break;
        
      case 'page.locked':
        // Page was locked, revalidate to show locked state
        revalidatePath('/blogs');
        revalidatePath('/blogs/[slug]', 'page');
        revalidateTag('blogs');
        break;
        
      case 'data_source.schema_updated':
      case 'database.schema_updated':
        // Database schema changed, revalidate all pages
        revalidatePath('/blogs');
        revalidatePath('/blogs/[slug]', 'page');
        revalidateTag('blogs');
        console.log('Database schema updated, revalidated all blog pages');
        break;
        
      case 'comment.created':
        // Comment added, might affect page display
        revalidatePath('/blogs');
        revalidatePath('/blogs/[slug]', 'page');
        revalidateTag('blogs');
        break;
        
      default:
        // For unknown event types, revalidate everything to be safe
        revalidatePath('/blogs');
        revalidatePath('/blogs/[slug]', 'page');
        revalidateTag('blogs');
        console.log(`Unknown event type (${eventType}), revalidated all blog pages`);
    }
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      eventType,
      entityType,
      revalidated: true,
      timestamp: new Date().toISOString(),
      processingTimeMs: processingTime
    }, {
      status: 200,
      headers: {
        'X-Processing-Time': `${processingTime}ms`
      }
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('Error processing Notion webhook:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      processingTimeMs: processingTime
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}

/**
 * Verify Notion webhook signature using HMAC-SHA256
 * 
 * Notion sends signatures in the format: "sha256=<hex-digest>"
 * Reference: https://developers.notion.com/reference/webhooks
 */
function verifyNotionWebhookSignature(
  rawBody: string,
  signature: string,
  verificationToken: string
): boolean {
  if (!signature || !verificationToken) {
    return false;
  }
  
  try {
    // Notion signature format: "sha256=<hex-digest>"
    // Remove "sha256=" prefix if present
    const cleanSignature = signature.replace(/^sha256=/, '').trim();
    
    // Create HMAC hash using verification token
    // Note: Use JSON.stringify format (minified, no spaces) to match Notion's format
    const bodyObj = JSON.parse(rawBody);
    const bodyJson = JSON.stringify(bodyObj); // This matches Notion's JSON.stringify format
    
    const hmac = crypto.createHmac('sha256', verificationToken);
    hmac.update(bodyJson);
    const expectedSignature = hmac.digest('hex');
    
    // Compare signatures (use constant-time comparison to prevent timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(cleanSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying Notion webhook signature:', error);
    return false;
  }
}

/**
 * GET endpoint for webhook verification and health check
 * Useful for testing and verifying the endpoint is accessible
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Notion webhook endpoint is active',
    endpoint: '/api/webhooks/notion',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString(),
    documentation: 'See docs/NOTION_WEBHOOK_SETUP.md for setup instructions'
  });
}

