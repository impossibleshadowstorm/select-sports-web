export const formatSportName = (sport: string): string => {
  return sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
};
