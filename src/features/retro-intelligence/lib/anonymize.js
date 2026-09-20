import { mockTeam } from "../../../data/mockTeam";

// The Learning Loop queue is the one place Component 4 data leaves the
// project for another component (C2/C3), so an evidence excerpt quoted
// straight from a retrospective transcript (mockCrossValidation.js's
// `evidenceExcerpt`, e.g. "[00:09] Yasodha Wijeratne: ...") can't carry a
// team member's name across that boundary. Two-or-more-capitalized-words
// is the signal transcript text names a specific person; anyone found on
// the team roster is swapped for their role instead of their name.
// Anyone NOT found (a name this lookup can't vouch for, a stakeholder
// outside the roster, say) is left in place but reported as a residual
// match, so the Anonymization gate fails closed rather than silently
// letting an unverified name through.
const NAME_PATTERN = /\b[A-Z][a-z']+(?:\s[A-Z][a-z']+)+\b/g;

export function anonymizeExcerpt(text) {
  if (!text) return { text: "", residualNames: [] };
  const residualNames = [];
  const anonymized = text.replace(NAME_PATTERN, (match) => {
    const member = mockTeam.find((m) => m.name === match);
    if (member) return `[${member.jobTitle}]`;
    residualNames.push(match);
    return match;
  });
  return { text: anonymized, residualNames };
}
