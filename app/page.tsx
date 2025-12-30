// Main page component - Stock market information portal
// Renders all major sections: header, ticker, stock info, chart, news, footer
// Links to: All components in @/app/components/
import { Header } from '@/app/components/Header';
import { TickerBar } from '@/app/components/TickerBar';
import { StockInfo } from '@/app/components/StockInfo';
import { DataTable } from '@/app/components/DataTable';
import { AppPromotion } from '@/app/components/AppPromotion';
import { Footer } from '@/app/components/Footer';
import { TopLayout } from '@/app/components/TopLayout';

export default function Home() {
  return (
    <div className="min-h-svh bg-white">
      {/* Header */}
      <Header />

      {/* Ticker Bar */}
      <TickerBar />

      {/* Main Content Area - Order controlled by CSS for responsive layout */}
      <div className="flex flex-col">
        {/* Top Layout - Displayed first on mobile/tablet, first on desktop */}
        <div className="order-1 md:order-1">
          <TopLayout />
        </div>

        {/* Stock Info - Displayed second on mobile/tablet, second on desktop */}
        <div className="order-2 md:order-2">
          <StockInfo />
        </div>
      </div>

      {/* Data Table */}
      <DataTable />



      {/* App Promotion */}
      <AppPromotion />

      {/* Footer */}
      <Footer />
    </div>
  );
}
