const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");

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

    result.innerHTML = "Memproses gambar...";

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

        const resultText = await resultResponse.text();

        result.innerHTML = `<pre>${resultText}</pre>`;

    } catch (error) {

        console.error(error);

        result.innerHTML =
            "Gagal terhubung ke Hugging Face API.";

    }
}
