// sheets-integration.js - Working with Google Sheets (NO localStorage)

let apiUrl = null;

function initSheetDB(apiUrlParam) {
  apiUrl = apiUrlParam;
  console.log('✅ API Ready:', apiUrl);
  return { isReady: true };
}

// Register user - sends data to Google Sheets
async function registerUser(userData) {
  try {
    const formData = new URLSearchParams();
    formData.append("action", "register");
    formData.append("fullName", userData.fullName);
    formData.append("schoolId", userData.schoolId);
    formData.append("program", userData.program);
    formData.append("subject", userData.subject || "Pathfit");
    formData.append("yearLevel", userData.yearLevel);
    formData.append("section", userData.section);
    formData.append("password", userData.password);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    console.log("Register API response:", result);
    return result;
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "Connection error. Please check your internet." };
  }
}

// Login user - checks credentials against Google Sheets
async function loginUser(schoolId, password) {
  try {
    const formData = new URLSearchParams();
    formData.append("action", "login");
    formData.append("schoolId", schoolId);
    formData.append("password", password);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    console.log("Login API response:", result);
    return result;
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Connection error. Please check your internet." };
  }
}

// Test connection
async function testAPIConnection() {
  try {
    const formData = new URLSearchParams();
    formData.append("action", "getUsers");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, message: "API connected", userCount: result.length };
    }
    return { success: false, message: "API not reachable" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}