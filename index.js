// TODO: harus tambah service worker

let db;
const dbName = "jadwal_adzan";

const URL_LIST_KOTA =
  "https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/kota.json";

function get_url_jadwal_adzan(kota) {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  return `https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/${kota}/${formattedDate}.json`;
}

const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("data_kota")) {
    db.createObjectStore("data_kota", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = async function (event) {
  db = event.target.result;
  console.log("Database opened successfully");

  try {
    let data_kota = await getDataFromDB("data_kota");
    if (!data_kota.length) {
      console.log("Data not found in IndexedDB, fetching from URL...");
      data_kota = await fetchDataAndStore(URL_LIST_KOTA, "data_kota");
    }
    // console.log("data_kota:", data_kota);
    const select_kota = document.getElementById("select_kota");
    // Kosongkan opsi dulu
    select_kota.innerHTML = "";
    // Masukan opsi kota dari list
    data_kota.forEach((kota) => {
      const e = document.createElement("option");
      e.value = kota.item;
      e.textContent = kota.item;
      select_kota.appendChild(e);
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

request.onerror = function (event) {
  console.error("Database error: ", event.target.errorCode);
};

async function fetchDataAndStore(url, data_point_store) {
  const response = await fetch(url);
  const data = await response.json();
  await putDataInDB(data_point_store, data);
  return data;
}

async function putDataInDB(objectName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([objectName], "readwrite");
    const objectStore = transaction.objectStore(objectName);

    data.forEach((item) => {
      objectStore.put({ item });
    });

    transaction.oncomplete = function (event) {
      resolve("Data added to the database successfully");
    };

    transaction.onerror = function (event) {
      reject("Transaction not opened due to error: " + transaction.error);
    };
  });
}

async function getDataFromDB(objectName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([objectName]);
    const objectStore = transaction.objectStore(objectName);
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
      resolve(request.result);
    };

    request.onerror = function (event) {
      reject("Unable to retrieve data from the database: " + request.error);
    };
  });
}

function appendCardToContainer(containerId, cardTitle, cardSubtitle, schedule) {
  // Create card element
  const card = document.createElement("div");
  card.className = "col-lg-4 col-md-6 col-sm-12";

  const cardInner = `
        <div class="card shadow">
            <div class="card-body">
                <h5 class="card-title">${cardTitle}</h5>
                <h6 class="card-subtitle mb-2 text-body-secondary">${cardSubtitle}</h6>
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            <th>Jam</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Subuh</td>
                            <td>${schedule.shubuh}</td>
                        </tr>
                        <tr>
                            <td>Dzuhur</td>
                            <td>${schedule.dzuhur}</td>
                        </tr>
                        <tr>
                            <td>Ashr</td>
                            <td>${schedule.ashr}</td>
                        </tr>
                        <tr>
                            <td>Maghrib</td>
                            <td>${schedule.magrib}</td>
                        </tr>
                        <tr>
                            <td>Isya'</td>
                            <td>${schedule.isya}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

  card.innerHTML = cardInner;

  // Append card to the container
  document.getElementById(containerId).appendChild(card);
}

/* form */
function prevent_submit(event) {
  event.preventDefault();
  const selected_new_kota = document.getElementById("select_kota").value;
  console.log("Tambah jadwal kota", selected_new_kota);

  const obj_name_jadwal = "jadwal_" + selected_new_kota;

  if (!db.objectStoreNames.contains(obj_name_jadwal)) {
    db.createObjectStore(obj_name_jadwal, {
      keyPath: "id",
      autoIncrement: true,
    });
  }
}
