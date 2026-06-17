"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useT } from "@/components/bscl/locale-provider";

export function DemoExitModal({
  open,
  onCancel,
  onConfirm,
  loading,
  error,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}) {
  const t = useT();

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !loading && onCancel()}>
      <AlertDialogContent className="border-chart-3/30 ring-chart-3/20">
        <AlertDialogHeader className="text-left sm:text-left">
          <AlertDialogTitle className="font-heading text-xl">
            {t.demo.exitTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>{t.demo.exitDesc}</AlertDialogDescription>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t.demo.exitCancel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {loading ? <Spinner data-icon="inline-start" /> : null}
            {loading ? "…" : t.demo.exitConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
