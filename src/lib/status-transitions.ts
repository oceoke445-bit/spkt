import type { ReportStatus, LetterStatus, ComplaintStatus } from '@/lib/types/spkt';

const REPORT_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  draft: ['draft', 'submitted'],
  submitted: ['verified', 'assigned', 'rejected'],
  verified: ['assigned', 'rejected'],
  assigned: ['processing', 'rejected'],
  processing: ['completed', 'rejected'],
  completed: [],
  rejected: [],
};

const LETTER_TRANSITIONS: Record<LetterStatus, LetterStatus[]> = {
  draft: ['submitted'],
  submitted: ['verified', 'rejected'],
  verified: ['ready', 'rejected'],
  ready: ['completed'],
  completed: [],
  rejected: [],
};

const COMPLAINT_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  submitted: ['reviewing', 'closed'],
  reviewing: ['processing', 'closed'],
  processing: ['resolved', 'closed'],
  resolved: ['closed'],
  closed: [],
};

export function canTransitionReport(
  from: ReportStatus,
  to: ReportStatus,
  options?: { adminOverride?: boolean },
): boolean {
  if (from === to) return true;
  if (options?.adminOverride) return true;
  return REPORT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionLetter(from: LetterStatus, to: LetterStatus): boolean {
  if (from === to) return true;
  return LETTER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionComplaint(from: ComplaintStatus, to: ComplaintStatus): boolean {
  if (from === to) return true;
  return COMPLAINT_TRANSITIONS[from]?.includes(to) ?? false;
}
