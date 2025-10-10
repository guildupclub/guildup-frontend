import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { leadsDb } from '@/lib/leadFirebase';
import type { DiagnosticLeadSubmission } from '@/types/diagnosticLead';

export async function saveDiagnosticLead(data: DiagnosticLeadSubmission): Promise<string> {
  try {
    // Filter out undefined values to avoid Firebase errors
    const cleanData = {
      name: data.name,
      phone: data.phone,
      email: data.email || null, // Convert undefined to null
      responses: data.responses, // Now contains {value: number, text: string} for each question
      score: data.score,
      level: data.level,
      userId: data.userId || null, // Convert undefined to null
      timestamp: Timestamp.fromDate(new Date()),
    };
    
    const docRef = await addDoc(collection(leadsDb, 'diagnostic_leads'), cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving diagnostic lead:', error);
    throw new Error('Failed to save diagnostic lead. Please try again.');
  }
}
