import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatINR, formatDateIN } from "@/lib/format";
import { ArrowUp, ArrowDown, Search } from "lucide-react";

interface PriceRecord {
  id: string;
  itemId: string;
  itemName: string;
  unitPrice: number;
  poNumber: string;
  supplierName: string;
  recordedDate: string;
}

const PriceTracker = () => {
  const [priceHistory, setPriceHistory] = useState<PriceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("priceHistory");
    if (stored) {
      setPriceHistory(JSON.parse(stored));
    }
  }, []);

  const filteredHistory = priceHistory.filter(record =>
    record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByItem = filteredHistory.reduce((acc, record) => {
    if (!acc[record.itemId]) {
      acc[record.itemId] = [];
    }
    acc[record.itemId].push(record);
    return acc;
  }, {} as Record<string, PriceRecord[]>);

  Object.keys(groupedByItem).forEach(itemId => {
    groupedByItem[itemId].sort((a, b) => 
      new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime()
    );
  });

  const getPriceChange = (currentPrice: number, previousPrice: number) => {
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    return change;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Price Tracker</h1>
        <p className="text-muted-foreground">Track item price changes over time</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by item name, supplier, or PO number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {Object.entries(groupedByItem).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No price history available. Create purchase orders to track prices.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByItem).map(([itemId, records]) => {
            const currentRecord = records[0];
            const previousRecord = records[1];
            const priceChange = previousRecord 
              ? getPriceChange(currentRecord.unitPrice, previousRecord.unitPrice)
              : null;

            return (
              <Card key={itemId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{currentRecord.itemName}</CardTitle>
                      <CardDescription>
                        Current Price: <span className="font-semibold text-foreground">{formatINR(currentRecord.unitPrice)}</span>
                      </CardDescription>
                    </div>
                    {priceChange !== null && (
                      <Badge variant={priceChange > 0 ? "destructive" : "default"} className="gap-1">
                        {priceChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(priceChange).toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record, index) => {
                        const prevRecord = records[index + 1];
                        const change = prevRecord 
                          ? getPriceChange(record.unitPrice, prevRecord.unitPrice)
                          : null;

                        return (
                          <TableRow key={record.id}>
                            <TableCell>{formatDateIN(record.recordedDate)}</TableCell>
                            <TableCell>{record.poNumber}</TableCell>
                            <TableCell>{record.supplierName}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatINR(record.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              {change !== null && (
                                <span className={change > 0 ? "text-destructive" : "text-green-600"}>
                                  {change > 0 ? "+" : ""}{change.toFixed(2)}%
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriceTracker;
