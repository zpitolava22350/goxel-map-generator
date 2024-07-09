// Function to load and parse the voxel data file
async function parseVoxelFile() {
  try {
      // Fetch the file
      const response = await fetch('http://127.0.0.1:5500/bruh.txt');
      // Check if the response is OK
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Read the content as text
      const text = await response.text();
      // Split the content by line separator (handling both Windows \r\n and Unix \n)
      const lines = text.split(/\r?\n/);
      // Initialize an array to store the coordinates
      const coordinatesArray = [];
      // Iterate through each line
      lines.forEach(line => {
          // Skip comment lines starting with '#'
          if (line.trim() === '' || line.startsWith('#')) return;
          // Split the line by spaces to extract X, Y, and Z coordinates
          const [x, y, z, color] = line.split(' ');
          // Parse coordinates as integers and add to the array
          coordinatesArray.push([parseInt(x), parseInt(y), parseInt(z)]);
      });
      // Return the array of coordinates
      return coordinatesArray;
  } catch (error) {
      console.error('Error:', error);
  }
}

// Example usage
parseVoxelFile('path/to/your/voxeldata.txt').then(coordinatesArray => {
  world.mapArray = coordinatesArray;
  world.generate();
});
