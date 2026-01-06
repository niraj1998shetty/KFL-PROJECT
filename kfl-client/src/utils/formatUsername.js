export const formatUsername = (name = "") => {
  if (!name) return "";
  const trimmed = name.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};
