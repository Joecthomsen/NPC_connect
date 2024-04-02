  // Function to map value to a color within the gradient
 export const getColorForProgress = (value: number) => {
  console.log("value: ", value);
    // Calculate the color gradient between red, yellow, and green
    const red = Math.max(
      0,
      Math.min(255, Math.floor((255 * (100 - value)) / 50))
    );
    const green = Math.max(0, Math.min(255, Math.floor((255 * value) / 50)));
    const blue = 0;
    return `rgb(${red},${green},${blue})`;
  };

//   // Function to map value to a color within the gradient
// export const getColorForProgressTemperature = (value: number) => {
//   console.log("value: ", value);
//   // Calculate the color gradient between blue, green, and red
//   const blue = Math.max(
//     0,
//     Math.min(255, Math.floor((255 * (100 - value)) / 50))
//   );
//   const green = Math.max(0, Math.min(255, Math.floor((255 * value) / 50)));
//   const red = 0;
//   return `rgb(${red},${green},${blue})`;
// };

// Function to map value to a color within the gradient
// Function to map value to a color within the gradient
// Function to map value to a color within the gradient
export const getColorForProgressTemperature = (value: number) => {
  console.log("value: ", value);
  
  // Calculate the color gradient between blue, green, and red
  let red, green, blue;

  if (value <= 50) {
    // Blue to Green gradient
    red = 0;
    green = Math.floor((255 * value) / 50);
    blue = Math.floor((255 * (50 - value)) / 50);
  } else {
    // Green to Red gradient
    red = Math.floor((255 * (value - 50)) / 50);
    green = Math.floor((255 * (100 - value)) / 50);
    blue = 0;
  }

  return `rgb(${red},${green},${blue})`;
};
