import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    // In a real app, verify user session here and get ownerId
    const ownerId = 'user1'; // Mock owner ID for MVP

    const body = await req.json();
    const { topic, platforms, languageMode, preferredLanguage, scheduledAt } = body;

    if (!topic || !platforms || !scheduledAt) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const jobData = {
      ownerId,
      topic,
      platforms,
      languageMode: languageMode || 'auto',
      preferredLanguage: preferredLanguage || null,
      scheduledAt: new Date(scheduledAt),
      state: 'SCHEDULED', // Initial state
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection('jobs').add(jobData);

    return NextResponse.json({ id: docRef.id, ...jobData });
  } catch (error) {
    console.error('Error creating job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // In a real app, verify user session and filter by ownerId
    const ownerId = 'user1'; 
    
    // Simple fetch for mock purposes
    const jobsSnap = await adminDb.collection('jobs')
      .where('ownerId', '==', ownerId)
      .orderBy('createdAt', 'desc')
      .get();
      
    const jobs = jobsSnap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      scheduledAt: doc.data().scheduledAt.toDate().toISOString(), // Serialize dates
      createdAt: doc.data().createdAt.toDate().toISOString(),
      updatedAt: doc.data().updatedAt.toDate().toISOString(),
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
