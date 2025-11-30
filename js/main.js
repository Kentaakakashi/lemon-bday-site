alert("✅ JS Loaded");

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("startBtn");

  if (!btn) {
    alert("❌ Button not found in index.html");
    return;
  }

  btn.addEventListener("click", function () {
    alert("✅ Button clicked, going to hub");
    window.location.href = "hub.html";
  });
});
