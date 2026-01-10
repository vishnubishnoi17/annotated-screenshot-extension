

console.log("Popup JS loaded");

document.getElementById("capture").addEventListener("click", () => {
  console.log("Button clicked");
  chrome.runtime.sendMessage({ action: "CAPTURE_FULL_PAGE" });
});
