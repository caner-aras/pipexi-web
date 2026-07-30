const AVATAR_BACKGROUNDS = ["ffedd5", "d1fae5", "fef3c7", "ccfbf1", "ffedd5", "dcfce7"] as const;

function pickBackground(seed: string): string {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }

  return AVATAR_BACKGROUNDS[Math.abs(hash) % AVATAR_BACKGROUNDS.length];
}

export function generateAvatarUrl(seed: string): string {
  const backgroundColor = pickBackground(seed);
  return `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(seed)}&size=128&backgroundColor=${backgroundColor}`;
}

export function resolveAvatarUrl(
  seed: string | null | undefined,
  avatarUrl?: string | null
): string | null {
  if (avatarUrl && avatarUrl.trim().length > 0) {
    return avatarUrl.trim();
  }

  if (!seed) {
    return null;
  }

  return generateAvatarUrl(seed);
}

export function generateRandomAvatarOptions(count = 8): string[] {
  return Array.from({ length: count }, (_, index) =>
    generateAvatarUrl(
      `pipexi-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 10)}`
    )
  );
}
