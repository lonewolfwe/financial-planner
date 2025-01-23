import FinancialPlanner from "@/components/FinancialPlanner";
import { WalletCards } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <WalletCards className="h-12 w-12 text-primary mr-4" />
          <h1 className="text-4xl font-bold text-primary">Financial Compass</h1>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xl text-muted-foreground">
              Your personalized journey to financial freedom starts here. Get AI-powered insights
              and create a roadmap to achieve your financial goals.
            </p>
          </div>
          <FinancialPlanner />
        </div>
      </div>
    </main>
  );
}