import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { scrapeInstagramProfile } from '@/lib/scraper';
import { generateMessages } from '@/lib/ai-generator';
import { Campaign, Contact } from '@/types/campaign';

export class CampaignService {
  private static readonly PROCESSING_BATCH_SIZE = 3;
  private static readonly MIN_DELAY_MS = 2000;
  private static readonly MAX_DELAY_MS = 5000;
  private static readonly UPDATE_INTERVAL = 5;

  static async getCampaign(id: string): Promise<Campaign | null> {
    const docRef = doc(db, 'campaigns', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      csvdata: data.csvdata.map((c: any) => ({
        ...c,
        lastUpdated: c.lastUpdated?.toMillis() || Date.now()
      })),
      createdAt: data.createdAt?.toMillis() || Date.now(),
      status: data.status || 'idle',
      processedCount: data.processedCount || 0,
      failedCount: data.failedCount || 0,
      startedAt: data.startedAt?.toMillis(),
      completedAt: data.completedAt?.toMillis(),
      error: data.error
    };
  }

  static async getAllCampaigns(): Promise<Campaign[]> {
    const querySnapshot = await getDocs(collection(db, 'campaigns'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        csvdata: data.csvdata.map((c: any) => ({
          ...c,
          lastUpdated: c.lastUpdated?.toMillis() || Date.now()
        })),
        createdAt: data.createdAt?.toMillis() || Date.now(),
        status: data.status || 'idle',
        processedCount: data.processedCount || 0,
        failedCount: data.failedCount || 0
      };
    });
  }

  static async processCampaign(
    campaignId: string, 
    progressCallback?: (progress: number) => void
  ) {
    const campaignRef = doc(db, 'campaigns', campaignId);
    
    try {
      await updateDoc(campaignRef, { 
        status: 'processing',
        startedAt: serverTimestamp(),
        processedCount: 0,
        failedCount: 0,
        error: null
      });

      const campaign = await this.getCampaign(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      const totalContacts = campaign.csvdata.length;
      let processedCount = 0;
      let failedCount = 0;
      const updatedContacts: Contact[] = [];

      for (let i = 0; i < totalContacts; i += this.PROCESSING_BATCH_SIZE) {
        const batch = campaign.csvdata.slice(i, i + this.PROCESSING_BATCH_SIZE);
        
        const batchResults = await Promise.all(
          batch.map(contact => this.processContact(contact))
        );

        batchResults.forEach(result => {
          processedCount++;
          if (result.processingError) failedCount++;
        });

        updatedContacts.push(...batchResults);
        progressCallback?.(Math.round((processedCount / totalContacts) * 100));

        if (processedCount % this.UPDATE_INTERVAL === 0 || processedCount === totalContacts) {
          await updateDoc(campaignRef, {
            csvdata: updatedContacts,
            processedCount,
            failedCount
          });
        }

        if (i + this.PROCESSING_BATCH_SIZE < totalContacts) {
          await this.randomDelay();
        }
      }

      await updateDoc(campaignRef, {
        status: failedCount > 0 ? 'completed_with_errors' : 'completed',
        completedAt: serverTimestamp()
      });

      return { success: true, processedCount, failedCount };
    } catch (error) {
      await updateDoc(campaignRef, { 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Processing failed',
        completedAt: serverTimestamp()
      });
      throw error;
    }
  }

  private static async processContact(contact: Contact): Promise<Contact> {
    if (contact.ai) return contact;

    try {
      const instagramData = await scrapeInstagramProfile(contact.instagramurl);
      const messages = await generateMessages(contact.name, instagramData);

      return {
        ...contact,
        ...messages,
        ai: true,
        lastUpdated: Date.now(),
        dataSource: instagramData.fallbackUsed ? 'fallback' : 'scraped',
        processingError: undefined
      };
    } catch (error) {
      console.error(`Failed to process contact ${contact.name}:`, error);
      return {
        ...contact,
        ai: false,
        processingError: error instanceof Error ? error.message : 'Unknown error',
        dataSource: 'fallback'
      };
    }
  }

  private static async randomDelay() {
    const delay = Math.random() * 
      (this.MAX_DELAY_MS - this.MIN_DELAY_MS) + this.MIN_DELAY_MS;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}