function addRow() {
  const tbody = document.querySelector("#shareholderTable tbody");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input placeholder="Name"></td>
    <td><input type="number" placeholder="%"></td>
    <td><input type="number" placeholder="Existing Cover"></td>
    <td><input type="number" placeholder="Annual Premium"></td>
    <td><button onclick="this.parentElement.parentElement.remove()">X</button></td>
  `;

  tbody.appendChild(row);
}

function getData() {
  const rows = document.querySelectorAll("#shareholderTable tbody tr");

  let data = [];

  rows.forEach(r => {
    const inputs = r.querySelectorAll("input");

    data.push({
      name: inputs[0].value,
      share: parseFloat(inputs[1].value || 0),
      cover: parseFloat(inputs[2].value || 0),
      premium: parseFloat(inputs[3].value || 0)
    });
  });

  return data;
}

// Core calculation
function calculate() {
  const data = getData();
  const companyValue = parseFloat(document.getElementById("companyValue").value);

  let totalShare = data.reduce((a,b) => a + b.share, 0);

  if (totalShare !== 100) {
    alert("Shareholding must total 100%");
    return;
  }

  // Share value + gap
  let shareValues = data.map(d => ({
    ...d,
    value: companyValue * d.share / 100
  }));

  // Matrix calculation
  let matrix = {};

  data.forEach(i => {
    matrix[i.name] = {};
    let total = 0;

    data.forEach(j => {
      if (i.name === j.name) return;

      let pay =
        i.premium *
        (j.share / (100 - i.share));

      matrix[j.name] = matrix[j.name] || {};
      matrix[j.name][i.name] = pay;

      total += pay;
    });

    matrix[i.name]["total"] = total;
  });

  render(shareValues, matrix);
}

function render(shareValues, matrix) {

  let html = "<div class='card'><h2>Results</h2>";

  html += "<h3>Share Value</h3><table><tr><th>Name</th><th>Value</th></tr>";

  shareValues.forEach(d => {
    html += `<tr><td>${d.name}</td><td>RM ${d.value.toFixed(2)}</td></tr>`;
  });

  html += "</table>";

  html += "<h3>Premium Allocation Matrix</h3><table><tr><th>Payer \\ Receiver</th>";

  let names = shareValues.map(d => d.name);

  names.forEach(n => html += `<th>${n}</th>`);
  html += "<th>Total</th></tr>";

  names.forEach(payer => {
    html += `<tr><td>${payer}</td>`;

    names.forEach(receiver => {
      if (payer === receiver) {
        html += "<td>-</td>";
      } else {
        let val = matrix[payer][receiver] || 0;
        html += `<td>RM ${val.toFixed(0)}</td>`;
      }
    });

    html += `<td><b>RM ${matrix[payer].total.toFixed(0)}</b></td></tr>`;
  });

  html += "</table></div>";

  document.getElementById("results").innerHTML = html;
}
