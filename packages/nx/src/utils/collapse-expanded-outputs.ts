import { dirname } from 'path';

/**
 * Heuristic to prevent writing too many hash files
 */
const MAX_OUTPUTS_TO_CHECK_HASHES = 3;

export function collapseExpandedOutputs(expandedOutputs: string[]) {
  const tree: Set<string>[] = [];

  // Create a Tree of directories/files
  for (const output of expandedOutputs) {
    const pathParts = [];
    pathParts.unshift(output);
    let dir = dirname(output);
    while (dir !== dirname(dir)) {
      pathParts.unshift(dir);

      dir = dirname(dir);
    }

    for (let i = 0; i < pathParts.length; i++) {
      tree[i] ??= new Set<string>();
      tree[i].add(pathParts[i]);
    }
  }

  if (tree.length === 0) {
    return [];
  }

  // Find collapse level: the level before the first level with too many outputs
  let collapseLevel = tree.length - 1;
  for (let j = 0; j < tree.length; j++) {
    if (tree[j].size > MAX_OUTPUTS_TO_CHECK_HASHES) {
      collapseLevel = Math.max(0, j - 1);
      break;
    }
  }

  // Collect paths, preserving leaf paths that terminate before collapse level
  const result = new Set<string>();

  for (let level = 0; level <= collapseLevel; level++) {
    for (const path of tree[level]) {
      const nextLevel = tree[level + 1];
      // Check if this path continues deeper in the tree
      const continuesDeeper =
        nextLevel &&
        Array.from(nextLevel).some((child) => child.startsWith(path + '/'));

      // Include path if it's at collapse level or doesn't continue deeper (leaf)
      if (level === collapseLevel || !continuesDeeper) {
        result.add(path);
      }
    }
  }

  return Array.from(result);
}
