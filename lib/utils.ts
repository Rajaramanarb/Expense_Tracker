import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { techMap } from "@/constants/techMap";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDeviconClassName = (techName: string) => {
  const normalizedTechName = techName.replace(/[ .]/g, "").toLowerCase();

  return techMap[normalizedTechName]
    ? `${techMap[normalizedTechName]} colored`
    : "devicon-devicon-plain";
};

export const formUrlQuery = ({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string;
}) => {
  const searchParams = new URLSearchParams(params);
  searchParams.set(key, value);
  return `?${searchParams.toString()}`;
};

export const removeKeysFromUrlQuery = ({
  params,
  keysToRemove,
}: {
  params: string;
  keysToRemove: string[];
}) => {
  const searchParams = new URLSearchParams(params);
  keysToRemove.forEach((key) => searchParams.delete(key));
  return `?${searchParams.toString()}`;
};
