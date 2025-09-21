const SHEET_ID = "1bCy2b8gmTMC1udTDWK14ys4JP9qOtXLbL7IXx9WRWqM";  
const SHEET_NAME = "ucapan";

// --- Render HTML ---
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Raikan Cinta 20 Disember 2025')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- Submit ucapan ---
function submitUcapan(name, message){
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const timestamp = new Date();
  sheet.appendRow([name, message, timestamp]);
  return { status: "success" };
}

// --- Fetch semua ucapan ---
function getUcapan(){
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const messages = [];
  
  for(let i = 1; i < data.length; i++){
    messages.push({
      name: data[i][0],
      message: data[i][1],
      timestamp: Utilities.formatDate(new Date(data[i][2]), "GMT+8", "dd MMM yyyy HH:mm")
    });
  }
  return messages;
}
