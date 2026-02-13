import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SectionContainerProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
}

export default function SectionContainer({
  id,
  title,
  icon: Icon,
  children,
}: SectionContainerProps) {
  return (
    <section id={id} className="scroll-mt-16 py-12 md:py-16">
      {/* Section Header */}
      <div className="mb-8 flex items-center gap-3 border-l-2 border-celestial-500/30 pl-4">
        {Icon && <Icon className="h-6 w-6 shrink-0 text-celestial-400" />}
        <h2 className="text-2xl font-bold text-celestial-100 md:text-3xl">
          {title}
        </h2>
      </div>

      {/* Section Content */}
      {children}

      {/* Decorative Divider */}
      <div className="mt-12 h-px bg-linear-to-r from-celestial-500/20 via-midnight-700 to-transparent md:mt-16" />
    </section>
  );
}
