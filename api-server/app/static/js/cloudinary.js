const form = document.querySelector("#upload-form");
const resultBox = document.querySelector("#upload-result");

if (form && resultBox) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    resultBox.textContent = "Uploading...";

    try {
      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: new FormData(form),
      });
      const payload = await response.json();
      resultBox.textContent = JSON.stringify(payload, null, 2);

      if (!response.ok && payload.message) {
        resultBox.textContent = JSON.stringify(payload, null, 2);
      }

      if (!response.ok) {
        resultBox.classList.add("error");
      } else {
        resultBox.classList.remove("error");
      }
    } catch (error) {
      resultBox.classList.add("error");
      resultBox.textContent = `Upload failed: ${error.message}`;
    }
  });
}
