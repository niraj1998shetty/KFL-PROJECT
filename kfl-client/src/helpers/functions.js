
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
  export const formatUsername = (fullName) => {
    if (!fullName) return "";
    return fullName.charAt(0).toUpperCase() + fullName.slice(1).toLowerCase();
  };
  
  // Add more string utility functions here as needed
