import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { leadsDb } from '@/lib/leadFirebase';
import type { DiagnosticLeadSubmission } from '@/types/diagnosticLead';

export interface InquirySubmission {
  name: string;
  phone: string;
  email?: string;
  concerns?: string;
  userId?: string;
}

export async function saveDiagnosticLead(data: DiagnosticLeadSubmission): Promise<string> {
  try {
    // Determine source based on level
    const source = data.level === 'lead_gen' ? 'need_help_dialog' : 'diagnostic_test';
    
    // Validate required fields before processing
    if (!data.name?.trim() || !data.phone?.trim()) {
      throw new Error('Name and phone are required fields');
    }
    
    // Filter out undefined and empty string values to avoid Firebase errors
    const cleanData: any = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null, // Convert undefined/empty to null
      concerns: data.concerns?.trim() || null, // Convert undefined/empty to null
      responses: data.responses || {}, // Ensure it's always an object
      score: data.score || 0,
      level: data.level || 'lead_gen',
      source: source, // Track where the lead came from
      userId: data.userId || null, // Convert undefined to null
      timestamp: serverTimestamp(), // Use server timestamp for consistency
    };
    
    console.log('Attempting to save lead data to Firebase:', {
      name: cleanData.name,
      phone: cleanData.phone,
      email: cleanData.email,
      concerns: cleanData.concerns ? 'provided' : 'not provided',
      source: cleanData.source,
      level: cleanData.level,
      collection: 'diagnostic_leads'
    });
    
    // Verify Firebase connection
    if (!leadsDb) {
      throw new Error('Firebase database connection is not initialized');
    }
    
    const docRef = await addDoc(collection(leadsDb, 'diagnostic_leads'), cleanData);
    console.log('✅ Lead saved successfully to Firebase!');
    console.log('Collection: diagnostic_leads');
    console.log('Document ID:', docRef.id);
    console.log('Full path:', `diagnostic_leads/${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error saving diagnostic lead to Firebase:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    console.error('Error name:', error?.name);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firebase Firestore security rules for the diagnostic_leads collection.');
    } else if (error?.code === 'unavailable') {
      throw new Error('Firebase service is unavailable. Please check your internet connection and try again.');
    } else if (error?.code === 'failed-precondition') {
      throw new Error('Firebase operation failed. Please try again.');
    } else if (error?.message) {
      throw new Error(`Failed to save lead: ${error.message}`);
    } else {
      throw new Error(`Failed to save lead: ${error?.toString() || 'Unknown error occurred'}`);
    }
  }
}

export async function saveInquiry(data: InquirySubmission): Promise<string> {
  try {
    // Validate required fields before processing
    if (!data.name?.trim() || !data.phone?.trim()) {
      throw new Error('Name and phone are required fields');
    }
    
    // Filter out undefined and empty string values to avoid Firebase errors
    const cleanData: any = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null, // Convert undefined/empty to null
      concerns: data.concerns?.trim() || null, // Convert undefined/empty to null
      userId: data.userId || null, // Convert undefined to null
      timestamp: serverTimestamp(), // Use server timestamp for consistency
      source: 'need_help_dialog', // Track where the inquiry came from
    };
    
    console.log('Attempting to save inquiry to Firebase:', {
      name: cleanData.name,
      phone: cleanData.phone,
      email: cleanData.email,
      concerns: cleanData.concerns ? 'provided' : 'not provided',
      source: cleanData.source,
      collection: 'inquiry'
    });
    
    // Verify Firebase connection
    if (!leadsDb) {
      throw new Error('Firebase database connection is not initialized');
    }
    
    const docRef = await addDoc(collection(leadsDb, 'inquiry'), cleanData);
    console.log('✅ Inquiry saved successfully to Firebase!');
    console.log('Collection: inquiry');
    console.log('Document ID:', docRef.id);
    console.log('Full path:', `inquiry/${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error saving inquiry to Firebase:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    console.error('Error name:', error?.name);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firebase Firestore security rules for the inquiry collection.');
    } else if (error?.code === 'unavailable') {
      throw new Error('Firebase service is unavailable. Please check your internet connection and try again.');
    } else if (error?.code === 'failed-precondition') {
      throw new Error('Firebase operation failed. Please try again.');
    } else if (error?.message) {
      throw new Error(`Failed to save inquiry: ${error.message}`);
    } else {
      throw new Error(`Failed to save inquiry: ${error?.toString() || 'Unknown error occurred'}`);
    }
  }
}
