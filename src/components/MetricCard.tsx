import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    text: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'warning' | 'purple' | 'pink';
  badge?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  variant = 'default',
  badge,
  className,
}) => {
  const isWarning = variant === 'warning' || variant === 'pink';

  return (
    <div
      className={twMerge(
        clsx(
          'relative overflow-hidden rounded-2xl p-6 transition-all duration-300',
          'bg-space-900 border border-space-800 shadow-lg',
          'hover:border-opacity-60 hover:shadow-2xl',
          {
            // Default electric purple accent glow
            'hover:border-purple-500/40 hover:shadow-purple-glow': !isWarning,
            // Pink warning glow when near/over budget limit
            'border-pink-500/30 bg-gradient-to-br from-space-900 via-space-900 to-pink-950/20 hover:border-pink-400/60 hover:shadow-pink-glow':
              isWarning,
          },
          className
        )
      )}
    >
      {/* Background ambient lighting overlay */}
      <div
        className={clsx(
          'absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl pointer-events-none opacity-20',
          isWarning ? 'bg-pink-500' : 'bg-purple-500'
        )}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {/* Card Header: Icon, Title & Optional Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div
                className={clsx(
                  'flex items-center justify-center p-2.5 rounded-xl border transition-colors',
                  isWarning
                    ? 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                    : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                )}
              >
                {icon}
              </div>
            )}
            <h3 className="font-montserrat text-sm font-semibold tracking-wide text-gray-400 uppercase">
              {title}
            </h3>
          </div>

          {badge && (
            <span
              className={clsx(
                'px-2.5 py-1 text-xs font-semibold rounded-full border',
                isWarning
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              )}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Card Body: Metric Value */}
        <div>
          <div className="font-montserrat text-3xl font-extrabold tracking-tight text-gray-100">
            {value}
          </div>
        </div>

        {/* Card Footer: Subtitle or Trend indicator */}
        {(subtitle || change) && (
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-space-800/60">
            {subtitle && <span>{subtitle}</span>}
            {change && (
              <span
                className={clsx('font-medium inline-flex items-center space-x-1', {
                  'text-emerald-400': change.isPositive && !change.isNeutral,
                  'text-pink-400': !change.isPositive && !change.isNeutral,
                  'text-gray-400': change.isNeutral,
                })}
              >
                <span>{change.text}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
