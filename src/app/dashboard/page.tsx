// app/dashboard/page.tsx
import { CampaignCard } from '@/components/CampaignCard';
import { CampaignService } from '@/services/campaign-service';

export default async function DashboardPage() {
  const campaigns = await CampaignService.getAllCampaigns();

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Campaigns</h1>
      {campaigns.length === 0 ? (
        <p className="text-gray-500">No campaigns found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </main>
  );
}