// -----------------------------
// Payment Entry Page 
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const paymentForm = document.getElementById("paymentForm");

  if (paymentForm) {
    paymentForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const entry = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        amount: document.getElementById("amount").value,
        method: document.getElementById("method").value,
        type: document.getElementById("type").value,
        date: document.getElementById("date").value,
        nextDate: document.getElementById("nextDate").value,
        reminder: document.getElementById("reminder").checked,
      };

      try {
        const res = await fetch("http://localhost:3000/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });

        if (res.ok) {
          alert("Payment saved successfully!");
          paymentForm.reset();
        } else {
          alert("Failed to save payment.");
        }
      } catch (err) {
        console.error("Error saving payment:", err);
      }
    });
  }
});

// -----------------------------
// Dashboard Page 
// -----------------------------

async function loadPayments() {
  const table = document.querySelector("#paymentTable tbody");
  if (!table) return;

  try {
    const res = await fetch("http://localhost:3000/api/payments");
    const data = await res.json();
    table.innerHTML = "";

    data.forEach((p, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" class="row-select" data-id="${p.id}"></td>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.email}</td>
        <td>${p.amount}</td>
        <td>${p.method}</td>
        <td>${p.type}</td>
        <td>${p.date}</td>
        <td>${p.nextDate || "-"}</td>
        <td>${p.reminder ? "✔️" : "❌"}</td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading payments:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Load payments if on dashboard page
  if (document.querySelector("#paymentTable")) {
    loadPayments();
  }

  // Clear Selected Rows
  const clearBtn = document.getElementById("clearSelected");
  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      const selected = [...document.querySelectorAll(".row-select:checked")];
      const ids = selected.map(cb => cb.dataset.id);

      if (ids.length === 0) {
        alert("Please select at least one record to delete.");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/payments/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });

        if (res.ok) {
          alert("Selected records cleared!");
          loadPayments();
        } else {
          alert("Failed to clear records.");
        }
      } catch (err) {
        console.error("Error clearing records:", err);
      }
    });
  }

  // Search Filter
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const filter = searchInput.value.toLowerCase();
      document.querySelectorAll("#paymentTable tbody tr").forEach((row) => {
        const name = row.cells[2].innerText.toLowerCase();
        row.style.display = name.includes(filter) ? "" : "none";
      });
    });
  }

  // Select All Checkbox
  const selectAll = document.getElementById("selectAll");
  if (selectAll) {
    selectAll.addEventListener("change", () => {
      const checked = selectAll.checked;
      document.querySelectorAll(".row-select").forEach(
        (cb) => (cb.checked = checked)
      );
    });
  }
});
