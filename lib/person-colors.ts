import type { Shift } from "@/types/shift";

export interface PersonColor {
  background: string;
  border: string;
  text: string;
  avatar: string;
  break: string;
}

export const PERSON_COLORS_LIGHT: PersonColor[] = [
  {
    background: "#FFEDD5",
    border: "#FDBA74",
    text: "#C2410C",
    avatar: "#FB923C",
    break: "#FED7AA",
  },
  {
    background: "#D1FAE5",
    border: "#6EE7B7",
    text: "#047857",
    avatar: "#34D399",
    break: "#A7F3D0",
  },
  {
    background: "#FEF3C7",
    border: "#FCD34D",
    text: "#B45309",
    avatar: "#FBBF24",
    break: "#FDE68A",
  },
  {
    background: "#CCFBF1",
    border: "#5EEAD4",
    text: "#0F766E",
    avatar: "#2DD4BF",
    break: "#99F6E4",
  },
  {
    background: "#FFEDD5",
    border: "#F97316",
    text: "#9A3412",
    avatar: "#F97316",
    break: "#FED7AA",
  },
  {
    background: "#DCFCE7",
    border: "#4ADE80",
    text: "#166534",
    avatar: "#22C55E",
    break: "#BBF7D0",
  },
  {
    background: "#FEF9C3",
    border: "#FACC15",
    text: "#A16207",
    avatar: "#EAB308",
    break: "#FEF08A",
  },
  {
    background: "#ECFDF5",
    border: "#34D399",
    text: "#0F9D78",
    avatar: "#10B981",
    break: "#A7F3D0",
  },
];

export const PERSON_COLORS_DARK: PersonColor[] = [
  {
    background: "#2A1408",
    border: "#9A3412",
    text: "#FDBA74",
    avatar: "#C2410C",
    break: "#7C2D12",
  },
  {
    background: "#052E1C",
    border: "#065F46",
    text: "#6EE7B7",
    avatar: "#047857",
    break: "#064E3B",
  },
  {
    background: "#2A1F05",
    border: "#92400E",
    text: "#FCD34D",
    avatar: "#B45309",
    break: "#78350F",
  },
  {
    background: "#042F2E",
    border: "#0F766E",
    text: "#5EEAD4",
    avatar: "#0D9488",
    break: "#115E59",
  },
  {
    background: "#431407",
    border: "#C2410C",
    text: "#FB923C",
    avatar: "#EA580C",
    break: "#9A3412",
  },
  {
    background: "#052E16",
    border: "#166534",
    text: "#86EFAC",
    avatar: "#15803D",
    break: "#14532D",
  },
  {
    background: "#422006",
    border: "#A16207",
    text: "#FDE047",
    avatar: "#CA8A04",
    break: "#854D0E",
  },
  {
    background: "#022C22",
    border: "#0F9D78",
    text: "#6EE7B7",
    avatar: "#059669",
    break: "#064E3B",
  },
];

function hashKey(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

export function getPersonColorByKey(key: string, isDark = false): PersonColor {
  const palette = isDark ? PERSON_COLORS_DARK : PERSON_COLORS_LIGHT;
  return palette[hashKey(key) % palette.length];
}

export function getShiftPersonColor(shift: Shift, isDark = false): PersonColor {
  const key =
    shift.organizationMemberId ??
    shift.organizationMember?.id ??
    shift.team?.id ??
    shift.id;

  return getPersonColorByKey(key, isDark);
}
