export const jsonToCsv = (jsonData) => {
    const delimiter = ',';
    const keys = Object.keys(jsonData[0]);
    const csvRows = [];
  
    // Add header row
    csvRows.push(keys.join(delimiter));
  
    // Add data rows
    jsonData.forEach(row => {
      const values = keys.map(key => row[key]);
      csvRows.push(values.join(delimiter));
    });
  
    // Join rows with newline character
    return csvRows.join('\n');
  };
  