const animalSelect = document.getElementById("animal-id");
const initialWeightInput = document.getElementById("InitialWeight");
const targetWeightInput = document.getElementById("TargetWeight");
const priceInput = document.getElementById("StartPricePerHead");
const durationInput = document.getElementById("ExpectedDurationDays");
const barnInsuranceFee = document.getElementById("barn-insurance-fee");

if (animalSelect instanceof HTMLSelectElement
    && initialWeightInput instanceof HTMLInputElement
    && targetWeightInput instanceof HTMLInputElement
    && priceInput instanceof HTMLInputElement
    && durationInput instanceof HTMLInputElement
    && barnInsuranceFee) {
    animalSelect.addEventListener("change", () => {
        const selected = animalSelect.selectedOptions.item(0);
        if (!selected) {
            return;
        }

        initialWeightInput.value = selected.dataset.initialWeight ?? "";
        targetWeightInput.value = selected.dataset.targetWeight ?? "";
        priceInput.value = selected.dataset.price ?? "";
        durationInput.value = selected.dataset.duration ?? "";
        const insuranceCost = Number(selected.dataset.barnInsuranceCost) || 0;
        barnInsuranceFee.textContent = new Intl.NumberFormat("ar-EG", { minimumFractionDigits: 2 }).format(insuranceCost);
    });
}

/** @param {HTMLElement} container */
function renumberRows(container) {
    const rows = container.querySelectorAll("[data-dynamic-row]");
    rows.forEach((row, index) => {
        row.querySelectorAll("input[data-property]").forEach((input) => {
            const property = input.dataset.property;
            input.name = container.id === "stage-rows"
                ? `Stages[${index}].${property}`
                : `VaccineNames[${index}]`;
            if (property === "StageOrder") {
                input.value = String(index + 1);
            }
        });
    });
}

document.querySelectorAll("button[data-add-row]").forEach((button) => {
    button.addEventListener("click", () => {
        const containerId = button.dataset.addRow;
        if (!containerId) {
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        const templateId = container.id === "stage-rows" ? "stage-row-template" : "vaccine-row-template";
        const template = document.getElementById(templateId);
        if (!(template instanceof HTMLTemplateElement)) {
            return;
        }

        const index = container.querySelectorAll("[data-dynamic-row]").length;
        const rowHtml = template.innerHTML
            .replaceAll("__index__", String(index))
            .replaceAll("__order__", String(index + 1));
        container.insertAdjacentHTML("beforeend", rowHtml);
    });
});

document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const removeButton = event.target.closest("[data-remove-row]");
    if (!removeButton) {
        return;
    }

    const container = removeButton.closest("#stage-rows, #vaccine-rows");
    const row = removeButton.closest("[data-dynamic-row]");
    if (container && row) {
        row.remove();
        renumberRows(container);
    }
});

document.getElementById("create-cycle-form")?.addEventListener("submit", () => {
    document.querySelectorAll("#stage-rows, #vaccine-rows").forEach((container) => {
        renumberRows(container);
    });
});
