import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
  className,
}) => {
  return (
    <Card className={cn("hover:border-slate-300 transition-all", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          {icon && <div className="text-slate-400 p-2 bg-slate-50 rounded-lg">{icon}</div>}
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded",
              trendType === 'positive' && "text-emerald-700 bg-emerald-50",
              trendType === 'negative' && "text-rose-700 bg-rose-50",
              trendType === 'neutral' && "text-slate-600 bg-slate-100"
            )}>
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};
