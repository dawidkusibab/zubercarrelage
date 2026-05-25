export const NAV_LINKS = [
  { href: '#home',      label: 'Accueil'      },
  { href: '#company',   label: 'Histoire'     },
  { href: '#services',  label: 'Services'     },
  { href: '#portfolio', label: 'Réalisations' },
  { href: '#contact',   label: 'Contact'      },
] as const;

export type NavLink = typeof NAV_LINKS[number];
