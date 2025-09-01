import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building, Upload, Save, Settings } from "lucide-react";
import { useApp } from "@/store/AppContext";
import { toast } from "@/hooks/use-toast";

const BusinessSetup = () => {
  const { businessInfo, gstSettings, setBusinessInfo, setGstSettings } = useApp();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBusinessInfo({ ...businessInfo, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    toast({ title: "Saved", description: "Business settings updated." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Setup</h1>
          <p className="text-muted-foreground mt-1">
            Configure your business information and settings for documents.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-light rounded-lg">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Business Information</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Business Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {businessInfo.logo ? (
                    <img src={businessInfo.logo} alt="Business Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input id="logo" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <label htmlFor="logo" className="cursor-pointer">
                      <Upload className="w-4 h-4 inline mr-1" /> Upload Logo
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                placeholder="Enter your complete business address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  placeholder="your-email@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number (Optional)</Label>
              <Input
                id="gstNumber"
                value={businessInfo.gstNumber || ""}
                onChange={(e) => setBusinessInfo({ ...businessInfo, gstNumber: e.target.value })}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Authorized Signature</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {businessInfo.signature ? (
                    <img src={businessInfo.signature} alt="Signature" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-xs text-muted-foreground">No signature</div>
                  )}
                </div>
                <div>
                  <input 
                    id="signature" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setBusinessInfo({ ...businessInfo, signature: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }} 
                    className="hidden" 
                  />
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <label htmlFor="signature" className="cursor-pointer">
                      <Upload className="w-4 h-4 inline mr-1" /> Upload Signature
                    </label>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">GST Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="gstEnabled">Enable GST Calculations</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply GST to purchase orders and goods receipts
                  </p>
                </div>
                <Switch
                  id="gstEnabled"
                  checked={gstSettings.enabled}
                  onCheckedChange={(checked) => setGstSettings({ ...gstSettings, enabled: checked })}
                />
              </div>

              <Separator />

              {gstSettings.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                    <Input
                      id="sgstRate"
                      type="number"
                      value={gstSettings.sgstRate}
                      onChange={(e) => setGstSettings({ ...gstSettings, sgstRate: parseFloat(e.target.value) || 0 })}
                      placeholder="9"
                      min={0}
                      max={28}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                    <Input
                      id="cgstRate"
                      type="number"
                      value={gstSettings.cgstRate}
                      onChange={(e) => setGstSettings({ ...gstSettings, cgstRate: parseFloat(e.target.value) || 0 })}
                      placeholder="9"
                      min={0}
                      max={28}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;
