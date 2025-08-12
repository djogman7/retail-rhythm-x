import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Package, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { apiService, BestSalePrdModel } from "@/lib/api";

export default function Sales() {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    debut: apiService.formatDateTimeForAPI(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    fin: apiService.formatDateTimeForAPI(new Date())
  });

  // Get stores
  const { data: storesResponse } = useQuery({
    queryKey: ['stores'],
    queryFn: () => apiService.getMagasins(),
  });

  // Get best selling products
  const { data: bestProductsResponse, isLoading: isBestProductsLoading } = useQuery({
    queryKey: ['bestProducts', selectedStore, dateRange],
    queryFn: async () => {
      if (!selectedStore) return { success: false, data: [] };
      return await apiService.getBestSalesProducts(
        parseInt(selectedStore), 
        dateRange.debut, 
        dateRange.fin
      );
    },
    enabled: !!selectedStore,
  });

  // Get sales evolution
  const { data: evolutionData } = useQuery({
    queryKey: ['salesEvolution', selectedStore, dateRange],
    queryFn: async () => {
      const startDate = new Date(dateRange.debut).toISOString().split('T')[0];
      const endDate = new Date(dateRange.fin).toISOString().split('T')[0];
      return await apiService.getEvolutionCA(startDate, endDate, selectedStore);
    },
    enabled: !!selectedStore,
  });

  const stores = (storesResponse as any)?.data || [];
  const bestProducts = (bestProductsResponse as any)?.data || [];

  const calculateProductStats = (products: BestSalePrdModel[]) => {
    if (!products.length) return null;
    
    return {
      totalRevenue: products.reduce((sum, p) => sum + p.montantTTC, 0),
      totalQuantity: products.reduce((sum, p) => sum + p.quantiteVendue, 0),
      totalSales: products.reduce((sum, p) => sum + p.nombreVentes, 0),
      avgPrice: products.reduce((sum, p) => sum + (p.montantTTC / p.quantiteVendue), 0) / products.length
    };
  };

  const productStats = calculateProductStats(bestProducts);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analysis of your sales performance
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Store</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.codeMagasin} value={store.codeMagasin}>
                      {store.nomMagasin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="datetime-local"
                value={dateRange.debut.split(' ')[0] + 'T' + dateRange.debut.split(' ')[1]}
                onChange={(e) => setDateRange(prev => ({ 
                  ...prev, 
                  debut: apiService.formatDateTimeForAPI(new Date(e.target.value))
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="datetime-local"
                value={dateRange.fin.split(' ')[0] + 'T' + dateRange.fin.split(' ')[1]}
                onChange={(e) => setDateRange(prev => ({ 
                  ...prev, 
                  fin: apiService.formatDateTimeForAPI(new Date(e.target.value))
                }))}
              />
            </div>

            <div className="flex items-end">
              <Button className="w-full bg-gradient-primary">
                <Calendar className="w-4 h-4 mr-2" />
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedStore && productStats && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Revenue"
                value={`${productStats.totalRevenue.toLocaleString()}€`}
                subtitle="From selected products"
                icon={DollarSign}
                variant="success"
              />
              <StatsCard
                title="Items Sold"
                value={productStats.totalQuantity}
                subtitle="Total quantity"
                icon={Package}
              />
              <StatsCard
                title="Sales Count"
                value={productStats.totalSales}
                subtitle="Number of sales"
                icon={ShoppingCart}
              />
              <StatsCard
                title="Avg Unit Price"
                value={`${productStats.avgPrice.toFixed(2)}€`}
                subtitle="Per unit"
                icon={TrendingUp}
              />
            </div>

            {/* Charts and Tables */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Sales Evolution Chart */}
              {evolutionData && (
                <SalesChart
                  data={evolutionData}
                  title="Sales Evolution"
                  type="line"
                />
              )}

              {/* Best Selling Products */}
              <Card className="bg-gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Best Selling Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isBestProductsLoading ? (
                    <div className="text-center py-8">Loading products...</div>
                  ) : bestProducts.length > 0 ? (
                    <div className="space-y-4">
                      {bestProducts.slice(0, 10).map((product, index) => (
                        <div key={product.codeProduit} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-sm font-medium text-primary">
                                #{index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{product.nomProduit}</p>
                              <p className="text-xs text-muted-foreground">
                                Code: {product.codeProduit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {product.montantTTC.toLocaleString()}€
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.quantiteVendue} units
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No data available for selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!selectedStore && (
          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Store</h3>
                <p className="text-muted-foreground">
                  Choose a store to view detailed sales analytics
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}