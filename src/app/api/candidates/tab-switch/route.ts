import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Candidate from '@/lib/models/Candidate';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { candidateId, reason, cameraImage, screenImage } = await request.json();

        if (!candidateId) {
            return NextResponse.json({ error: 'candidateId required' }, { status: 400 });
        }

        console.log('[tab-switch API]', {
            candidateId,
            reason,
            hasCameraImage: !!cameraImage,
            hasScreenImage: !!screenImage,
            cameraImageSize: cameraImage ? cameraImage.length : 0,
            screenImageSize: screenImage ? screenImage.length : 0,
        });

        const screenshotEntry = (cameraImage || screenImage) ? {
            reason: reason || 'tab-switch',
            cameraImage,
            screenImage,
            timestamp: new Date()
        } : null;

        const updateQuery: Record<string, Record<string, unknown>> = {};
        
        if (reason === 'paste') {
            updateQuery.$set = { copyPasteDetected: true };
        } else if (reason === 'tab-switch' || !reason) {
            updateQuery.$inc = { tabSwitchCount: 1 };
        } else if (reason === 'no-face') {
            updateQuery.$inc = { noFaceDetectCount: 1 };
        }
        
        if (screenshotEntry) {
            updateQuery.$push = { violationScreenshots: screenshotEntry };
        }

        if (Object.keys(updateQuery).length > 0) {
            await Candidate.findByIdAndUpdate(candidateId, updateQuery);
        }
        
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Tab switch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
