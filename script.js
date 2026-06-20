const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");

const loading = document.getElementById("loading");
const result = document.getElementById("result");

const expression = document.getElementById("expression");
const confidence = document.getElementById("confidence");
const fill = document.getElementById("fill");

let selectedFile = null;

imageInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];

    if (selectedFile) {
        preview.src = URL.createObjectURL(selectedFile);
        preview.style.display = "block";
    }
});

async function predictImage() {

    if (!selectedFile) {
        alert("Pilih gambar terlebih dahulu!");
        return;
    }

    loading.classList.remove("hidden");
    result.classList.add("hidden");

    try {

        const formData = new FormData();
        formData.append("files", selectedFile);

        const uploadResponse = await fetch(
            "https://syabihul-pet.hf.space/gradio_api/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const uploaded = await uploadResponse.json();

        const response = await fetch(
            "https://syabihul-pet.hf.space/gradio_api/call/predict",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: [
                        {
                            path: uploaded[0]
                        }
                    ]
                })
            }
        );

        const eventData = await response.json();

        const eventId = eventData.event_id;

        const resultResponse = await fetch(
            `https://syabihul-pet.hf.space/gradio_api/call/predict/${eventId}`
        );

        const text = await resultResponse.text();

        console.log(text);

        loading.classList.add("hidden");

        expression.textContent = "Berhasil diproses";
        confidence.textContent = "Lihat Console (F12)";
        fill.style.width = "100%";

        result.classList.remove("hidden");

    } catch (err) {

        console.error(err);

        loading.classList.add("hidden");

        expression.textContent = "Error";
        confidence.textContent = "0%";
        fill.style.width = "0%";

        result.classList.remove("hidden");
    }
}
