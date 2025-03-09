
export const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  export const getCapitalizedInitial = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase();
  };
  
  // Add more string utility functions here as needed