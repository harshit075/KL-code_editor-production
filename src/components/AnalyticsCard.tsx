import Link from 'next/link';

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'indigo' | 'emerald' | 'amber' | 'rose';
    href?: string;
}

const colorMap = {
    indigo: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        icon: 'text-indigo-400',
        value: 'text-indigo-300',
    },
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: 'text-emerald-400',
        value: 'text-emerald-300',
    },
    amber: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: 'text-amber-400',
        value: 'text-amber-300',
    },
    rose: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        icon: 'text-rose-400',
        value: 'text-rose-300',
    },
};

export default function AnalyticsCard({ title, value, subtitle, icon, color, href }: AnalyticsCardProps) {
    const colors = colorMap[color];

    const CardContent = (
        <div className={`glass-card p-5 ${colors.bg} border ${colors.border} transition-smooth hover:scale-[1.02] cursor-pointer`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400 font-medium">{title}</p>
                    <p className={`text-3xl font-bold mt-2 ${colors.value}`}>{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block w-full">{CardContent}</Link>;
    }

    return CardContent;
}
