import { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardWidgetProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export const DashboardWidget = ({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: DashboardWidgetProps) => {
  return (
    <Card className={cn("dashboard-panel border-white/10 bg-white/75 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-card/90", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
};
