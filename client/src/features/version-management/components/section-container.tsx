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
    <section id={id} className="scroll-mt-16 py-8 md:py-12 lg:py-16">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-2 border-l-2 border-celestial-500/30 pl-3 md:mb-8 md:gap-3 md:pl-4">
        {Icon && (
          <Icon className="h-5 w-5 shrink-0 text-celestial-400 md:h-6 md:w-6" />
        )}
        <h2 className="text-xl font-bold text-celestial-100 md:text-2xl lg:text-3xl">
          {title}
        </h2>
      </div>

      {/* Section Content */}
      {children}

      {/* Decorative Divider */}
      <div className="mt-8 h-px bg-linear-to-r from-celestial-500/20 via-midnight-700 to-transparent md:mt-12 lg:mt-16" />
    </section>
  );
}
