import type { AttackTalentType, OtherTalentType, Talent } from '../types';

export function sortPassives(a: Talent, b: Talent): number {
  const order = {
    '1st Ascension Passive': 1,
    '4th Ascension Passive': 2,
    'Utility Passive': 3,
  };

  return (
    (order[a.talentType as keyof typeof order] || 999) -
    (order[b.talentType as keyof typeof order] || 999)
  );
}

export function getPassiveStyles(
  talentType: AttackTalentType | OtherTalentType
) {
  switch (talentType) {
    case '1st Ascension Passive':
      return {
        borderClass: 'border-celestial-500/30 hover:border-celestial-400/50',
        bgClass: 'bg-gradient-to-br from-celestial-950/20 to-transparent',
        iconBgClass: 'bg-celestial-900/40',
        tagClass:
          'bg-celestial-900/50 text-celestial-200 border-celestial-700/50',
        glowClass: 'shadow-celestial-500/10',
      };
    case '4th Ascension Passive':
      return {
        borderClass: 'border-legendary-500/30 hover:border-legendary-400/50',
        bgClass: 'bg-gradient-to-br from-legendary-950/20 to-transparent',
        iconBgClass: 'bg-legendary-900/40',
        tagClass:
          'bg-legendary-900/50 text-legendary-200 border-legendary-700/50',
        glowClass: 'shadow-legendary-500/10',
      };
    case 'Utility Passive':
      return {
        borderClass: 'border-starlight-500/30 hover:border-starlight-400/50',
        bgClass: 'bg-gradient-to-br from-starlight-950/20 to-transparent',
        iconBgClass: 'bg-starlight-900/40',
        tagClass:
          'bg-starlight-900/50 text-starlight-200 border-starlight-700/50',
        glowClass: 'shadow-starlight-500/10',
      };
    default:
      return {
        borderClass: 'border-midnight-500/30 hover:border-midnight-400/50',
        bgClass: 'bg-gradient-to-br from-midnight-950/20 to-transparent',
        iconBgClass: 'bg-midnight-900/40',
        tagClass: 'bg-midnight-900/50 text-midnight-200 border-midnight-700/50',
        glowClass: 'shadow-midnight-500/10',
      };
  }
}
