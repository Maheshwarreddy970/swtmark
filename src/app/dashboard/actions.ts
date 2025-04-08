// app/dashboard/actions.ts
'use server';

import { CampaignService } from '@/services/campaign-service'; // Adjust path if needed
import { revalidatePath } from 'next/cache';

export async function generateCampaignMessages(
  campaignId: string,
  onProgress?: (progress: number) => void
) {
  try {
    await CampaignService.processCampaign(campaignId, onProgress);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process campaign',
    };
  }
}