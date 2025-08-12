import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, TrendingUp, Search, Filter } from "lucide-react";
import { apiService, StockModel } from "@/lib/api";

export default function Inventory() {
  const [stockFilter, setStockFilter] = useState<number>(1); // 0: all, 1: >0, 2: =0, 3: <0
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"barcode" | "code">("code");
  const [pagination, setPagination] = useState({ from: 0, to: 50 });

  // Get global stock
  const { data: stockResponse, isLoading: isStockLoading } = useQuery({
    queryKey: ['globalStock', pagination.from, pagination.to, stockFilter, searchQuery],
    queryFn: () => apiService.getGlobalStock(
      pagination.from,
      pagination.to,
      stockFilter,
      searchQuery || undefined
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Search specific product
  const [specificProduct, setSpecificProduct] = useState("");
  const { data: productStockResponse } = useQuery({
    queryKey: ['productStock', specificProduct, searchMode],
    queryFn: async () => {
      if (!specificProduct) return { success: false, data: null };
      return await apiService.getStockByProduct(searchMode === "barcode", specificProduct);
    },
    enabled: !!specificProduct,
  });

  const stockData = (stockResponse as any)?.data || [];

  const calculateStockStats = (stocks: StockModel[]) => {
    if (!stocks.length) return null;
    
    const totalValue = stocks.reduce((sum, item) => sum + (item.valeurStock || 0), 0);
    const totalItems = stocks.length;
    const lowStockItems = stocks.filter(item => 
      item.seuilMinimum && item.quantiteStock < item.seuilMinimum
    ).length;
    const outOfStockItems = stocks.filter(item => item.quantiteStock <= 0).length;

    return {
      totalValue,
      totalItems,
      lowStockItems,
      outOfStockItems,
      avgValue: totalValue / totalItems
    };
  };

  const stockStats = calculateStockStats(stockData);

  const getStockStatus = (item: StockModel) => {
    if (item.quantiteStock <= 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (item.seuilMinimum && item.quantiteStock < item.seuilMinimum) 
      return { label: "Low Stock", variant: "warning" as const };
    return { label: "In Stock", variant: "success" as const };
  };

  const loadMore = () => {
    setPagination(prev => ({ from: prev.to, to: prev.to + 50 }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your stock levels
          </p>
        </div>

        {/* Search Section */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Product Search</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Search Mode</Label>
              <Select value={searchMode} onValueChange={(value: "barcode" | "code") => setSearchMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code">Product Code</SelectItem>
                  <SelectItem value="barcode">Barcode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Search Product</Label>
              <Input
                placeholder={`Enter ${searchMode}...`}
                value={specificProduct}
                onChange={(e) => setSpecificProduct(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock Filter</Label>
              <Select value={stockFilter.toString()} onValueChange={(value) => setStockFilter(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">In Stock (&gt;0)</SelectItem>
                  <SelectItem value="2">Out of Stock (=0)</SelectItem>
                  <SelectItem value="3">Negative Stock (&lt;0)</SelectItem>
                  <SelectItem value="0">All Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Global Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search in inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Search Result */}
        {specificProduct && (productStockResponse as any)?.data && (
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Product Information</h3>
                  <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                    {JSON.stringify((productStockResponse as any).data, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {stockStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Inventory Value"
              value={`${stockStats.totalValue.toLocaleString()}€`}
              subtitle="Current stock value"
              icon={TrendingUp}
              variant="success"
            />
            <StatsCard
              title="Total Products"
              value={stockStats.totalItems}
              subtitle="Unique products"
              icon={Package}
            />
            <StatsCard
              title="Low Stock Items"
              value={stockStats.lowStockItems}
              subtitle="Below minimum threshold"
              icon={AlertTriangle}
              variant="warning"
            />
            <StatsCard
              title="Out of Stock"
              value={stockStats.outOfStockItems}
              subtitle="Zero quantity"
              icon={AlertTriangle}
              variant="destructive"
            />
          </div>
        )}

        {/* Inventory Table */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Stock Inventory
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {stockData.length} items loaded
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isStockLoading ? (
              <div className="text-center py-8">Loading inventory...</div>
            ) : stockData.length > 0 ? (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 p-3 bg-muted/30 rounded-lg font-medium text-sm">
                  <div>Product Code</div>
                  <div>Product Name</div>
                  <div>Quantity</div>
                  <div>Value</div>
                  <div>Min. Threshold</div>
                  <div>Status</div>
                </div>
                
                {/* Table Rows */}
                {stockData.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <div key={item.codeProduit} className="grid grid-cols-6 gap-4 p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="font-mono text-sm">{item.codeProduit}</div>
                      <div className="font-medium text-sm truncate" title={item.nomProduit}>
                        {item.nomProduit}
                      </div>
                      <div className="text-sm">{item.quantiteStock}</div>
                      <div className="text-sm">{item.valeurStock?.toLocaleString()}€</div>
                      <div className="text-sm">{item.seuilMinimum || "N/A"}</div>
                      <div>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {/* Load More Button */}
                <div className="text-center pt-4">
                  <Button onClick={loadMore} variant="outline">
                    Load More Items
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No inventory data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}