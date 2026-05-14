import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrencyArs } from "@/lib/formatters";

interface PatientLedgerAnalyticsProps {
  initialBudget: number;
  currentBudget: number;
  initialBudgetDate?: string;
  budgetIncreaseAmount: number;
  budgetIncreasePct: number;
  covered: number;
  pending: number;
  coveragePct: number;
}

function formatIsoDate(date?: string): string {
  if (!date) return "—";

  const isoDatePart = date.split("T")[0] ?? date;
  const [year, month, day] = isoDatePart.split("-");

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

export function PatientLedgerAnalytics({
  initialBudget,
  currentBudget,
  initialBudgetDate,
  budgetIncreaseAmount,
  budgetIncreasePct,
  covered,
  pending,
  coveragePct
}: PatientLedgerAnalyticsProps) {
  const variationSign = budgetIncreaseAmount > 0 ? "+" : budgetIncreaseAmount < 0 ? "-" : "";
  const variationLabel = `${variationSign}${budgetIncreasePct}%`;
  const isIncrease = budgetIncreaseAmount >= 0;
  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;
  const hasPendingBalance = pending > 0;

  return (
    <section className="grid gap-4 md:grid-cols-3" aria-label="Analítica de pagos">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Presupuesto actual</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrencyArs(currentBudget)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <TrendIcon className="size-3.5" />
              {variationLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="!border-t-0 !bg-transparent pt-0 flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex items-center gap-2 font-medium">
            {isIncrease ? "Aumento acumulado del presupuesto" : "Reducción acumulada del presupuesto"}
            <TrendIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Inicial: {formatCurrencyArs(initialBudget)} · Inicio: {formatIsoDate(initialBudgetDate)}
          </div>
          <div className="text-muted-foreground">
            Ajuste acumulado: {variationSign}
            {formatCurrencyArs(budgetIncreaseAmount)}
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Entregas Realizadas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrencyArs(covered)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="!border-t-0 !bg-transparent pt-0 flex-col items-start gap-2 text-sm">
          <Progress value={coveragePct} aria-label="Cobertura" />
          <div className="text-muted-foreground">{coveragePct}% del total cubierto</div>
        </CardFooter>
      </Card>

      <Card
        className={
          hasPendingBalance
            ? "border-red-200/80 bg-red-50/40 dark:border-red-900/60 dark:bg-red-950/20"
            : "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20"
        }
      >
        <CardHeader>
          <CardDescription
            className={
              hasPendingBalance ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"
            }
          >
            Saldo Pendiente
          </CardDescription>
          <CardTitle
            className={
              hasPendingBalance
                ? "text-2xl font-semibold tabular-nums text-red-700 @[250px]/card:text-3xl dark:text-red-300"
                : "text-2xl font-semibold tabular-nums text-emerald-700 @[250px]/card:text-3xl dark:text-emerald-300"
            }
          >
            {formatCurrencyArs(pending)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="!border-t-0 !bg-transparent pt-0 flex-col items-start gap-1.5 text-sm">
          <div
            className={
              hasPendingBalance
                ? "font-medium text-red-700 dark:text-red-300"
                : "font-medium text-emerald-700 dark:text-emerald-300"
            }
          >
            {hasPendingBalance ? "Importe pendiente de cancelación" : "Cuenta al día"}
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}
