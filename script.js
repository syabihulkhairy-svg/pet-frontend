const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");

const loading = document.getElementById("loading");
const result = document.getElementById("result");

const expression = document.getElementById("expression");
const confidence = document.getElementById("confidence");
const fill = document.getElementById("fill");

let selectedFile = null;

// Preview gambar
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

        // Upload gambar ke Hugging Face
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

        // Request prediksi
        const predictResponse = await fetch(
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

        const predictData = await predictResponse.json();
        const eventId = predictData.event_id;

        // Ambil hasil
        const resultResponse = await fetch(
            `https://syabihul-pet.hf.space/gradio_api/call/predict/${eventId}`
        );

        const text = await resultResponse.text();

        console.log(text);

        // Ambil JSON setelah "data:"
        const match = text.match(/data:\s*(.+)/);

        if (!match) {
            throw new Error("Data prediksi tidak ditemukan");
        }

        const data = JSON.parse(match[1]);

        // Data dari HF:
        // [{
        //   label: "Angry",
        //   confidences: [...]
        // }]

        const prediction = data[0];

        const label = prediction.label;

        const bestConfidence =
            Math.max(
                ...prediction.confidences.map(
                    item => item.confidence
                )
            );

        expression.textContent = label;

        confidence.textContent =
            (bestConfidence * 100).toFixed(2) + "%";

        fill.style.width =
            (bestConfidence * 100).toFixed(2) + "%";

        loading.classList.add("hidden");
        result.classList.remove("hidden");

    } catch (error) {

        console.error(error);

        loading.classList.add("hidden");

        expression.textContent = "Error";
        confidence.textContent = "0%";
        fill.style.width = "0%";

        result.classList.remove("hidden");

        alert("Gagal mengambil hasil prediksi");
    }
}
