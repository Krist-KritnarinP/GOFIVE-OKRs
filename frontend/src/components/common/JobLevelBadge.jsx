import { JOB_LEVELS } from '../../constants/roles.js';
import { StatusBadge } from './StatusBadge.jsx';

export function JobLevelBadge({ level = 'L2_MID', compact = false, lang = 'en' }) {
  const info = JOB_LEVELS.find((l) => l.id === level) || JOB_LEVELS[1];
  const text = compact ? info.short : lang === 'th' ? info.labelTh : info.label;
  return <StatusBadge tone={info.tone}>{text}</StatusBadge>;
}
