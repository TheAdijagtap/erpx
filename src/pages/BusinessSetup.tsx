import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building, Upload, Save, Settings } from "lucide-react";
import { BusinessInfo, GSTSettings } from "@/types/inventory";
import inventoryLogo from "@/assets/inventory-logo.png";

const BusinessSetup = () => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    id: "1",
    name: "Your Business Name",
    address: "Your Business Address",
    phone: "+91 00000 00000",
    email: "your-email@company.com",
    gstNumber: "",
    logo: inventoryLogo,
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  });

  const [gstSettings, setGstSettings] = useState<GSTSettings>({
    enabled: true,
    sgstRate: 9,
    cgstRate: 9,
  });

  const handleBusinessInfoChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBankDetailsChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails!,
        [field]: value,
      },
    }));
  };

  const handleGstSettingsChange = (field: string, value: boolean | number) => {
    setGstSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // In real app, this would save to API
    console.log("Saving business info:", businessInfo);
    console.log("Saving GST settings:", gstSettings);
    // Show success toast
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
        {/* Business Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-light rounded-lg">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Business Information</h2>
          </div>

          <div className="space-y-4">
            {/* Logo Upload */}
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
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
              </div>
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={businessInfo.name}
                onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
                placeholder="Enter your business name"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={businessInfo.address}
                onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                placeholder="Enter your complete business address"
                rows={3}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={businessInfo.phone}
                  onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                  placeholder="+91 00000 00000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                  placeholder="your-email@company.com"
                />
              </div>
            </div>

            {/* GST Number */}
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number (Optional)</Label>
              <Input
                id="gstNumber"
                value={businessInfo.gstNumber}
                onChange={(e) => handleBusinessInfoChange('gstNumber', e.target.value)}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
          </div>
        </Card>

        {/* Bank Details & GST Settings */}
        <div className="space-y-6">
          {/* Bank Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Bank Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={businessInfo.bankDetails?.bankName || ''}
                  onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={businessInfo.bankDetails?.accountNumber || ''}
                  onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={businessInfo.bankDetails?.ifscCode || ''}
                  onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value)}
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </Card>

          {/* GST Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent-light rounded-lg">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">GST Settings</h3>
            </div>

            <div className="space-y-4">
              {/* Enable/Disable GST */}
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
                  onCheckedChange={(checked) => handleGstSettingsChange('enabled', checked)}
                />
              </div>

              <Separator />

              {/* GST Rates */}
              {gstSettings.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                      <Input
                        id="sgstRate"
                        type="number"
                        value={gstSettings.sgstRate}
                        onChange={(e) => handleGstSettingsChange('sgstRate', parseFloat(e.target.value) || 0)}
                        placeholder="9"
                        min="0"
                        max="28"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                      <Input
                        id="cgstRate"
                        type="number"
                        value={gstSettings.cgstRate}
                        onChange={(e) => handleGstSettingsChange('cgstRate', parseFloat(e.target.value) || 0)}
                        placeholder="9"
                        min="0"
                        max="28"
                      />
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Total GST Rate:</strong> {gstSettings.sgstRate + gstSettings.cgstRate}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Preview Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Document Preview</h3>
        <div className="bg-card border rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <img src={businessInfo.logo} alt="Logo" className="w-12 h-12" />
            <div>
              <h4 className="font-bold text-foreground">{businessInfo.name}</h4>
              <p className="text-xs text-muted-foreground">{businessInfo.email}</p>
            </div>
          </div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>{businessInfo.address}</p>
            <p>Phone: {businessInfo.phone}</p>
            {businessInfo.gstNumber && <p>GST: {businessInfo.gstNumber}</p>}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BusinessSetup;