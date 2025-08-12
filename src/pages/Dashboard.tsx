import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";
import { apiService, DashboardModel } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<string | undefined>();

  // Get dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard', selectedStore],
    queryFn: () => apiService.getDashboardMagasins(selectedStore),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get stores list
  const { data: storesResponse } = useQuery({
    queryKey: ['stores'],
    queryFn: () => apiService.getMagasins(),
  });

  // Get evolution data for the last 30 days
  const { data: evolutionData } = useQuery({
    queryKey: ['evolution', selectedStore],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      return apiService.getEvolutionCA(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        selectedStore
      );
    },
    staleTime: 5 * 60 * 1000,
  });

  const calculateTotals = (data: DashboardModel[]) => {
    if (!data || data.length === 0) return null;
    
    return data.reduce((acc, store) => ({
      totalRevenue: acc.totalRevenue + store.montantTTC,
      totalTickets: acc.totalTickets + store.nombreTickets,
      totalQuantity: acc.totalQuantity + store.quantiteVendue,
      averageTicket: acc.averageTicket + store.prixMoyenTicket,
    }), {
      totalRevenue: 0,
      totalTickets: 0,
      totalQuantity: 0,
      averageTicket: 0,
    });
  };

  const totals = dashboardData ? calculateTotals(dashboardData) : null;
  const stores = storesResponse?.data || [];

  if (isDashboardLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your business performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Store filter */}
        {stores.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter by Store</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStore(undefined)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    !selectedStore 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                  }`}
                >
                  All Stores
                </button>
                {stores.map((store) => (
                  <button
                    key={store.codeMagasin}
                    onClick={() => setSelectedStore(store.codeMagasin)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      selectedStore === store.codeMagasin
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                    }`}
                  >
                    {store.nomMagasin}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {totals && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              value={totals.totalRevenue}
              subtitle="This period"
              icon={DollarSign}
              variant="success"
              trend={{
                value: 12.5,
                label: "from last month",
                isPositive: true
              }}
            />
            <StatsCard
              title="Total Tickets"
              value={totals.totalTickets}
              subtitle="Number of transactions"
              icon={ShoppingCart}
              trend={{
                value: 8.2,
                label: "from last month",
                isPositive: true
              }}
            />
            <StatsCard
              title="Items Sold"
              value={totals.totalQuantity}
              subtitle="Total quantity"
              icon={Package}
              trend={{
                value: -2.1,
                label: "from last month",
                isPositive: false
              }}
            />
            <StatsCard
              title="Avg Ticket"
              value={`${(totals.totalRevenue / totals.totalTickets).toFixed(2)}€`}
              subtitle="Average transaction"
              icon={TrendingUp}
              trend={{
                value: 4.3,
                label: "from last month",
                isPositive: true
              }}
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          {evolutionData && (
            <SalesChart
              data={evolutionData}
              title="Sales Evolution (Last 30 Days)"
              type="line"
            />
          )}
          
          {/* Top Stores Performance */}
          {dashboardData && (
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Store Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.slice(0, 5).map((store, index) => (
                    <div key={store.codeMagasin} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium text-primary">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{store.nomMagasin}</p>
                          <p className="text-sm text-muted-foreground">
                            {store.nombreTickets} tickets
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {store.montantTTC.toLocaleString()}€
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {store.quantiteVendue} items
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}