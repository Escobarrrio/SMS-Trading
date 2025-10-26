import Image from 'next/image';

export default function CI({
  name,
  size = 'md',
  color = 'primary',
  animate,
  className = '',
  title,
}: {
  name:
    | 'candidate'
    | 'interview'
    | 'job-posting'
    | 'connections'
    | 'team-collaboration'
    | 'performance-metrics'
    | 'skill-badge'
    | 'career-ladder';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  animate?: 'pulse' | 'bounce' | 'spin' | 'fade' | 'slide' | 'glow';
  className?: string;
  title?: string;
}) {
  const paths: Record<string, string> = {
    candidate: '/career-icons/icons/recruitment/candidate.svg',
    interview: '/career-icons/icons/recruitment/interview.svg',
    'job-posting': '/career-icons/icons/recruitment/job-posting.svg',
    connections: '/career-icons/icons/networking/connections.svg',
    'team-collaboration': '/career-icons/icons/networking/team-collaboration.svg',
    'performance-metrics': '/career-icons/icons/analytics/performance-metrics.svg',
    'skill-badge': '/career-icons/icons/skills/skill-badge.svg',
    'career-ladder': '/career-icons/icons/career-path/career-ladder.svg',
  };

  const animateClass = animate ? ` career-icon-animate-${animate}` : '';

  return (
    <span
      className={`career-icon career-icon-${size} career-icon-${color}${animateClass} ${className}`}
      title={title}
      aria-label={title ?? name.replace('-', ' ')}
    >
      <Image src={paths[name]} alt={name} width={48} height={48} />
    </span>
  );
}
