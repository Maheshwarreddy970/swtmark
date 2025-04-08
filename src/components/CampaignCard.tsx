// components/CampaignCard.tsx
'use client';

import { useState } from 'react';
import { generateCampaignMessages } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Campaign } from '@/types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    setIsProcessing(true);
    setProgress(0);

    const { success, error } = await generateCampaignMessages(campaign.id, (p) =>
      setProgress(p)
    );

    setIsProcessing(false);

    if (success) {
      toast.success(`Messages generated for ${campaign.name}`);
    } else {
      toast.error(error || 'Failed to generate messages');
    }
  };

  const completedCount = campaign.csvdata.filter((c) => c.ai).length;
  const totalCount = campaign.csvdata.length;

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{campaign.name}</h3>
        <span className="text-sm text-gray-500">
          {completedCount}/{totalCount} processed
        </span>
      </div>

      <div className="mb-4">
        <Progress value={(completedCount / totalCount) * 100} />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created: {new Date(campaign.createdAt).toLocaleDateString()}
        </span>
        <Button
          onClick={handleGenerate}
          disabled={isProcessing || campaign.status === 'processing'}
          variant={isProcessing ? 'secondary' : 'default'}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Spinner />
              {progress}%
            </span>
          ) : (
            'Generate Messages'
          )}
        </Button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}