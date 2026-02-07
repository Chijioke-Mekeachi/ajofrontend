import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useContributions } from "@/hooks/useContributions";
import { useWallet, formatNaira } from "@/hooks/useWallet";
import { Wallet, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface PayContributionModalProps {
  membershipId: string;
  ajoId: string;
  contributionAmount: number;
  cycleName: string;
}

export function PayContributionModal({
  membershipId,
  ajoId,
  contributionAmount,
  cycleName,
}: PayContributionModalProps) {
  const [open, setOpen] = useState(false);
  const { data: wallet, isLoading: isLoadingWallet } = useWallet();
  const { payContributionFromWallet, isPayingFromWallet } = useContributions(ajoId);

  const handlePay = async () => {
    try {
      await payContributionFromWallet({
        membershipId,
        ajoId,
      });
      setOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const balance = wallet?.balance ?? 0;
  const isInsufficient = balance < contributionAmount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Wallet className="w-4 h-4" />
          Pay Contribution
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Contribution</DialogTitle>
          <DialogDescription>
            Pay {formatNaira(contributionAmount)} for {cycleName} from your wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingWallet ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !wallet ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">Wallet not found for your account.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Please visit your Wallet page or contact support if this keeps happening.
              </p>
              <div className="mt-3">
                <Button asChild variant="outline">
                  <Link to="/dashboard/wallet">Go to Wallet</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Wallet balance</div>
                <div className="font-medium text-foreground">{formatNaira(balance)}</div>
              </div>

              {isInsufficient ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm text-destructive">
                    Insufficient wallet balance to pay {formatNaira(contributionAmount)}.
                  </p>
                  <div className="mt-3">
                    <Button asChild variant="outline">
                      <Link to="/dashboard/wallet">Fund Wallet</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">You’ll pay</span>
                    <span className="font-medium text-foreground">{formatNaira(contributionAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Balance after</span>
                    <span className="font-medium text-foreground">
                      {formatNaira(balance - contributionAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePay}
            disabled={isPayingFromWallet || isLoadingWallet || !wallet || isInsufficient}
          >
            {isPayingFromWallet ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${formatNaira(contributionAmount)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
