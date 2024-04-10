import axios from 'axios';
export const compareDataArrays = (originalArray, uploadArray) => {
// console.log(originalArray)
  const resultArray = [];

  const newData = uploadArray.filter(item => !originalArray?.some(existingItem => String(existingItem['MOBILE NO']) === String(item['MOBILE NO'])));
  
  originalArray.forEach(existingItem => {
    const matchingUploadItem = uploadArray.find(item => String(item['MOBILE NO']) === String(existingItem['MOBILE NO']));
  
    
    if (matchingUploadItem) {
      const updatedItem = compareAndUpdate(existingItem,matchingUploadItem);
      if (updatedItem) {
       // Push the updated item to resultArray
        resultArray.push(updatedItem);
        // console.log("updatedItem", updatedItem);
      }
    }else {
      // If no matching upload item, push the existing item directly to resultArray
      resultArray.push(existingItem);
    }
  });
  
  // Push new data directly to resultArray
  resultArray.push(...newData);
  // console.log("newData", newData);
  // console.log("resultArray", resultArray);
  
  return resultArray;
}

// Helper function to identify manipulated values and return remarks
function compareAndUpdate(originalObject, updatedObject) {
  const remarksList = [];

  for (const key in originalObject) {
      if (key !== "REMARKS" && updatedObject[key] !== originalObject[key]) {
          remarksList.push(originalObject[key]);
      }
  }

  const remarks = remarksList.join('|');

  const resultObject = {
      ...originalObject,
      REMARKS: originalObject.REMARKS ? originalObject.REMARKS + ' | ' + remarks : remarks,
  };

  return resultObject;
}





export const updateInDB = async (data) => {
  try {
    // Make API request to create a backup and overwrite data
    const result = (
      await axios.post(
        'http://jsram.aifuturevision.in:5000/api/upload',data
      )
    ).data;
    alert("Data Uploaded successfully");

    // Handle the response as needed, update local state, etc.
    return result;
  } catch (error) {
    // If the API request was not successful, handle the error
    alert("Data upload Failed");
    console.error('Error:', error.message);
  }
};

