
export const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  export const getCapitalizedInitial = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase();
  };

  export const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
};
  
export const formatNameMaxTwoWords = (fullName) => {
  if (!fullName) return '';

  return fullName
    .trim()
    .split(/\s+/)          // split by one or more spaces
    .slice(0, 2)           // take max 2 words
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
};

export const capitalizeEachWord = (fullName) => {
  if (!fullName) return '';

  return fullName
    .trim()
    .split(/\s+/)
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
};
   // Add more string utility functions here as needed
