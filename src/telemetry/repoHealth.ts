export interface RepoHealthInput {
  dirtyFiles: number;
  failingChecks: number;
  missingAnchors: number;
}

export function scoreRepoHealth(input: RepoHealthInput): number {
  const penalty =
    input.dirtyFiles * 4 + input.failingChecks * 12 + input.missingAnchors * 8;
  return Math.min(Math.max(100 - penalty, 0), 100);
}
