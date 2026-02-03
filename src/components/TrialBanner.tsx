import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageCircle, AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TrialBannerProps {
  trialStartDate: Date | null;
  subscriptionEndDate?: Date | null;
  onSubscribe: () => void;
}

const TRIAL_DAYS = 15;
const WHATSAPP_NUMBER = "919373751128";

export function calculateTrialStatus(trialStartDate: Date | null, subscriptionEndDate?: Date | null) {
  const now = new Date();

  // If user has a subscription, use that instead
  if (subscriptionEndDate) {
    const diffTime = subscriptionEndDate.getTime() - now.getTime();
    const daysRemaining = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      daysRemaining: Math.max(0, daysRemaining),
      // Block when 0 or less days remaining
      isExpired: daysRemaining <= 0,
      percentRemaining: Math.max(0, Math.min(100, (daysRemaining / 30) * 100)),
      isSubscription: true,
    };
  }

  // Otherwise use trial logic
  if (!trialStartDate) {
    return { daysRemaining: TRIAL_DAYS, isExpired: false, percentRemaining: 100, isSubscription: false };
  }

  const trialEnd = new Date(trialStartDate);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  const diffTime = trialEnd.getTime() - now.getTime();
  const daysRemaining = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return {
    daysRemaining: Math.max(0, daysRemaining),
    // Block when 0 or less days remaining
    isExpired: daysRemaining <= 0,
    percentRemaining: Math.max(0, Math.min(100, (daysRemaining / TRIAL_DAYS) * 100)),
    isSubscription: false,
  };
}

export function TrialStatusBadge({ trialStartDate, subscriptionEndDate }: { trialStartDate: Date | null; subscriptionEndDate?: Date | null }) {
  const { daysRemaining, isExpired, isSubscription } = calculateTrialStatus(trialStartDate, subscriptionEndDate);

  if (isExpired) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        {isSubscription ? "Subscription Expired" : "Trial Expired"}
      </Badge>
    );
  }

  // For subscriptions, show subscription countdown
  if (isSubscription) {
    return (
      <Badge 
        variant={daysRemaining <= 7 ? "secondary" : "default"}
        className="gap-1"
      >
        <Clock className="w-3 h-3" />
        {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
      </Badge>
    );
  }

  // For trials
  return (
    <Badge 
      variant={daysRemaining <= 3 ? "destructive" : daysRemaining <= 7 ? "secondary" : "default"}
      className="gap-1"
    >
      <Clock className="w-3 h-3" />
      {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
    </Badge>
  );
}

export function TrialExpiredOverlay() {
  const { signOut } = useAuth();

  const handleSubscribe = () => {
    const message = encodeURIComponent(
      "Hi! I would like to subscribe to OPIS app. My trial has expired and I want to continue using the service."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-destructive/20">
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Access Expired</h2>
          <p className="text-muted-foreground">
            Your subscription/trial has ended. To continue using OPIS and access all features, please subscribe to our service.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleSubscribe} 
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <MessageCircle className="w-5 h-5" />
            Subscribe via WhatsApp
          </Button>
          
          <Button 
            onClick={handleSignOut} 
            variant="outline"
            className="w-full gap-2"
            size="lg"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Contact us on WhatsApp to get your subscription activated instantly.
          </p>
        </div>
      </Card>
    </div>
  );
}

export function TrialBanner({ trialStartDate, subscriptionEndDate, onSubscribe }: TrialBannerProps) {
  const { daysRemaining, isExpired, isSubscription } = calculateTrialStatus(trialStartDate, subscriptionEndDate);

  if (isExpired) {
    return <TrialExpiredOverlay />;
  }

  // For subscriptions, show warning when 7 or fewer days remaining
  // For trials, show warning when 5 or fewer days remaining
  const warningThreshold = isSubscription ? 7 : 5;
  if (daysRemaining > warningThreshold) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <span className="font-medium text-foreground">
              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} {isSubscription ? "remaining in your subscription" : "left in your free trial"}
            </span>
            <span className="text-muted-foreground ml-2 text-sm">
              {isSubscription ? "Renew now to avoid interruption" : "Subscribe now to continue using all features"}
            </span>
          </div>
        </div>
        <Button 
          onClick={onSubscribe} 
          size="sm" 
          className="gap-2 bg-green-600 hover:bg-green-700 shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          {isSubscription ? "Renew" : "Subscribe"}
        </Button>
      </div>
    </div>
  );
}

export default TrialBanner;
