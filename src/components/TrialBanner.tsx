import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageCircle, AlertTriangle } from "lucide-react";

interface TrialBannerProps {
  trialStartDate: Date | null;
  onSubscribe: () => void;
}

const TRIAL_DAYS = 15;
const WHATSAPP_NUMBER = "919373751128";

export function calculateTrialStatus(trialStartDate: Date | null) {
  if (!trialStartDate) {
    return { daysRemaining: TRIAL_DAYS, isExpired: false, percentRemaining: 100 };
  }

  const now = new Date();
  const trialEnd = new Date(trialStartDate);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  const diffTime = trialEnd.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    daysRemaining: Math.max(0, daysRemaining),
    isExpired: daysRemaining <= 0,
    percentRemaining: Math.max(0, Math.min(100, (daysRemaining / TRIAL_DAYS) * 100)),
  };
}

export function TrialStatusBadge({ trialStartDate }: { trialStartDate: Date | null }) {
  const { daysRemaining, isExpired } = calculateTrialStatus(trialStartDate);

  if (isExpired) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        Trial Expired
      </Badge>
    );
  }

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
  const handleSubscribe = () => {
    const message = encodeURIComponent(
      "Hi! I would like to subscribe to CORS Inventory app. My trial has expired and I want to continue using the service."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-destructive/20">
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Free Trial Expired</h2>
          <p className="text-muted-foreground">
            Your 15-day free trial has ended. To continue using CORS Inventory and access all features, please subscribe to our service.
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
          
          <p className="text-xs text-muted-foreground">
            Contact us on WhatsApp to get your subscription activated instantly.
          </p>
        </div>
      </Card>
    </div>
  );
}

export function TrialBanner({ trialStartDate, onSubscribe }: TrialBannerProps) {
  const { daysRemaining, isExpired, percentRemaining } = calculateTrialStatus(trialStartDate);

  if (isExpired) {
    return <TrialExpiredOverlay />;
  }

  // Show warning banner when 5 or fewer days remaining
  if (daysRemaining > 5) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <span className="font-medium text-foreground">
              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left in your free trial
            </span>
            <span className="text-muted-foreground ml-2 text-sm">
              Subscribe now to continue using all features
            </span>
          </div>
        </div>
        <Button 
          onClick={onSubscribe} 
          size="sm" 
          className="gap-2 bg-green-600 hover:bg-green-700 shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          Subscribe
        </Button>
      </div>
    </div>
  );
}

export default TrialBanner;
