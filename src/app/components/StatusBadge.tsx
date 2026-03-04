interface StatusBadgeProps {
  status: 'protected' | 'warning' | 'critical' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
  const colors = {
    protected: 'bg-[#DDF7EC] text-green-700',
    warning: 'bg-[#FFD9CC] text-orange-700',
    critical: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[status]} ${className}`}>
      {children}
    </span>
  );
}
