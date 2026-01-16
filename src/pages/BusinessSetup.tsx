import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, Upload, Save, Settings, X } from "lucide-react";
import { useData } from "@/store/SupabaseDataContext";
import { toast } from "@/hooks/use-toast";

interface LocalBusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  logo: string;
  signature: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

const BusinessSetup = () => {
  const { businessInfo, setBusinessInfo } = useData();
  
  // Local state for form inputs to prevent lag
  const [localInfo, setLocalInfo] = useState<LocalBusinessInfo>({
    name: "",
    address: "",
    phone: "",
    email: "",
    gstNumber: "",
    logo: "",
    signature: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  // Sync local state with context on mount
  useEffect(() => {
    setLocalInfo({
      name: businessInfo.name || "",
      address: businessInfo.address || "",
      phone: businessInfo.phone || "",
      email: businessInfo.email || "",
      gstNumber: businessInfo.gstNumber || "",
      logo: businessInfo.logo || "",
      signature: businessInfo.signature || "",
      bankName: businessInfo.bankDetails?.bankName || "",
      accountNumber: businessInfo.bankDetails?.accountNumber || "",
      ifscCode: businessInfo.bankDetails?.ifscCode || "",
    });
  }, [businessInfo]);

  const handleLocalChange = (field: keyof LocalBusinessInfo, value: string) => {
    setLocalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLocalInfo(prev => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Update context with all local changes
    setBusinessInfo({
      ...businessInfo,
      name: localInfo.name,
      address: localInfo.address,
      phone: localInfo.phone,
      email: localInfo.email,
      gstNumber: localInfo.gstNumber,
      logo: localInfo.logo,
      signature: localInfo.signature,
      bankDetails: {
        bankName: localInfo.bankName,
        accountNumber: localInfo.accountNumber,
        ifscCode: localInfo.ifscCode,
      }
    });
    toast({ title: "Saved", description: "Business settings updated." });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Business Setup</h1>
          <p className="text-muted-foreground mt-1 text-sm">
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
                  {localInfo.logo ? (
                    <img src={localInfo.logo} alt="Business Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input id="logo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" />
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <label htmlFor="logo" className="cursor-pointer">
                      <Upload className="w-4 h-4 inline mr-1" /> Upload Logo
                    </label>
                  </Button>
                  {localInfo.logo && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => handleLocalChange('logo', '')}
                    >
                      <X className="w-4 h-4" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={localInfo.name}
                onChange={(e) => handleLocalChange('name', e.target.value)}
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={localInfo.address}
                onChange={(e) => handleLocalChange('address', e.target.value)}
                placeholder="Enter your complete business address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={localInfo.phone}
                  onChange={(e) => handleLocalChange('phone', e.target.value)}
                  placeholder="+91 00000 00000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={localInfo.email}
                  onChange={(e) => handleLocalChange('email', e.target.value)}
                  placeholder="your-email@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number (Optional)</Label>
              <Input
                id="gstNumber"
                value={localInfo.gstNumber}
                onChange={(e) => handleLocalChange('gstNumber', e.target.value)}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Authorized Signature</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {localInfo.signature ? (
                    <img src={localInfo.signature} alt="Signature" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-xs text-muted-foreground">No signature</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input 
                    id="signature" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'signature')} 
                    className="hidden" 
                  />
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <label htmlFor="signature" className="cursor-pointer">
                      <Upload className="w-4 h-4 inline mr-1" /> Upload Signature
                    </label>
                  </Button>
                  {localInfo.signature && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => handleLocalChange('signature', '')}
                    >
                      <X className="w-4 h-4" /> Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-light rounded-lg">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Bank Information</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={localInfo.bankName}
                  onChange={(e) => handleLocalChange('bankName', e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={localInfo.accountNumber}
                  onChange={(e) => handleLocalChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={localInfo.ifscCode}
                  onChange={(e) => handleLocalChange('ifscCode', e.target.value)}
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;
