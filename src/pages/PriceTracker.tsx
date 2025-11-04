import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatINR, formatDateIN } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface PriceHistoryRecord {
  id: string;
  item_id: string;
  item_name: string;
  unit_price: number;
  po_number: string | null;
  supplier_name: string | null;
  recorded_date: string;
  created_at: string;
}

interface ItemPriceStats {
  itemId: string;
  itemName: string;
  currentPrice: number;
  previousPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  recordCount: number;
  lastUpdated: string;
  history: PriceHistoryRecord[];
}

export default function PriceTracker() {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceHistory();
  }, []);

  const fetchPriceHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('item_price_history')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_date', { ascending: false });

      if (error) throw error;
      setPriceHistory(data || []);
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const itemStats = useMemo<ItemPriceStats[]>(() => {
    const itemMap = new Map<string, PriceHistoryRecord[]>();
    
    priceHistory.forEach(record => {
      const itemId = record.item_id || record.item_name;
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, []);
      }
      itemMap.get(itemId)!.push(record);
    });

    return Array.from(itemMap.entries()).map(([itemId, records]) => {
      const sortedRecords = [...records].sort((a, b) => 
        new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
      );

      const current = sortedRecords[0];
      const previous = sortedRecords[1];

      let priceChange = null;
      let priceChangePercent = null;

      if (previous) {
        priceChange = current.unit_price - previous.unit_price;
        priceChangePercent = ((priceChange / previous.unit_price) * 100);
      }

      return {
        itemId,
        itemName: current.item_name,
        currentPrice: current.unit_price,
        previousPrice: previous?.unit_price || null,
        priceChange,
        priceChangePercent,
        recordCount: records.length,
        lastUpdated: current.recorded_date,
        history: sortedRecords,
      };
    });
  }, [priceHistory]);

  const filteredStats = useMemo(() => {
    return itemStats.filter(stat =>
      stat.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [itemStats, searchTerm]);

  const getPriceChangeIcon = (change: number | null) => {
    if (!change) return <Minus className="w-4 h-4" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-destructive" />;
    return <TrendingDown className="w-4 h-4 text-green-600" />;
  };

  const getPriceChangeBadge = (change: number | null, percent: number | null) => {
    if (!change) return null;
    
    const variant = change > 0 ? "destructive" : "default";
    const text = `${change > 0 ? '+' : ''}${formatINR(change)} (${percent!.toFixed(1)}%)`;
    
    return <Badge variant={variant} className="text-xs">{text}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading price history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Price Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track price changes of items from purchase orders
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Items Tracked</p>
            <p className="text-2xl font-bold text-foreground mt-1">{itemStats.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold text-foreground mt-1">{priceHistory.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Price Increases</p>
            <p className="text-2xl font-bold text-destructive mt-1">
              {itemStats.filter(s => s.priceChange && s.priceChange > 0).length}
            </p>
          </Card>
        </div>

        {filteredStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No items found matching your search" : "No price history yet. Create purchase orders to start tracking prices."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStats.map((stat) => (
              <Card key={stat.itemId} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{stat.itemName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stat.recordCount} price {stat.recordCount === 1 ? 'record' : 'records'} · Last updated {formatDateIN(stat.lastUpdated)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {getPriceChangeIcon(stat.priceChange)}
                      <span className="text-xl font-bold text-foreground">
                        {formatINR(stat.currentPrice)}
                      </span>
                    </div>
                    {stat.previousPrice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          from {formatINR(stat.previousPrice)}
                        </span>
                        {getPriceChangeBadge(stat.priceChange, stat.priceChangePercent)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stat.history.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{formatDateIN(record.recorded_date)}</TableCell>
                          <TableCell>{record.po_number || '-'}</TableCell>
                          <TableCell>{record.supplier_name || '-'}</TableCell>
                          <TableCell className="text-right font-semibold">{formatINR(record.unit_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
