const links = [
  { label: 'Dashboard',   href: 'index.html',        group: 'core' },
  { label: 'Discord',     href: 'discord.html',       group: 'comms' },
  { label: 'Resend',      href: 'resend.html',        group: 'comms' },
  { label: 'Send',        href: 'send.html',          group: 'comms' },
  { label: 'Progress',    href: 'progress.html',      group: 'intel' },
  { label: 'Radar',       href: 'radar.html',         group: 'intel' },
  { label: 'Pipeline',    href: 'pipeline.html',      group: 'intel' },
  { label: 'Wiki',        href: 'wiki.html',          group: 'intel' },
  { label: 'Employees',   href: 'employees.html',     group: 'system' },
  { label: 'Chain',       href: 'chain.html',         group: 'system' },
  { label: 'Uploader',    href: 'uploader.html',      group: 'system' },
  { label: 'Arena',       href: 'arena/index.html',   group: 'system' },
];

const groups = {};
links.forEach(l => {
  if (!groups[l.group]) groups[l.group] = [];
  groups[l.group].push(l);
});

console.log('');
console.log('  ⚡ ANTCPU NAV FLOW');
console.log('  ─────────────────────────────────────────');
console.log('');
console.log('  [antcpu.com] ──► [localhost:3000]');
console.log('                        │');

const entries = Object.entries(groups);
entries.forEach(([group, items], gi) => {
  const isLast = gi === entries.length - 1;
  console.log('                        ' + (isLast ? '└' : '├') + '── [' + group.toUpperCase() + ']');
  items.forEach((item, i) => {
    const isLastItem = i === items.length - 1;
    const trunk = isLast ? ' ' : '│';
    console.log('                        ' + trunk + '     ' + (isLastItem ? '└' : '├') + '── ' + item.label + '  →  ' + item.href);
  });
  if (!isLast) console.log('                        │');
});

console.log('');
console.log('  ─────────────────────────────────────────');
console.log('  ' + links.length + ' routes · 4 groups · 1 nav config');
console.log('');
