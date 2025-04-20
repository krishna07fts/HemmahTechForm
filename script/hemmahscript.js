document.addEventListener("DOMContentLoaded", function () {
  localStorage.clear();
  initMap();
  getAddressByContactNumber();
  // getMaintenanceCity();
  // document
  //   .getElementById("neighborhood")
  //   .addEventListener("click", function () {
  //     getNeighbourHood();
  //   });
  // document.getElementById("city").addEventListener("click", function () {
  //   getMaintenanceCity();
  // });
  document.getElementById("service").addEventListener("click", function () {
    getServicesByAddressId();
  });
  var modal = document.getElementById("addressModal");
  var closeModalHeaderBtn = document.getElementById("closeModalHeaderBtn");
  var closeModalFooterBtn = document.getElementById("closeModalFooterBtn");
  var AddressCreate = document.getElementById("createAddress");
  var submitForm = document.getElementById("submitRequest");
  var plusIcon = document.querySelector(".create.la-plus");
  submitForm.onclick = function () {
    createRequest();
  };
  closeModalHeaderBtn.onclick = function () {
    clearAddressCreateForm();
    modal.style.display = "none";
  };
  // create click for address
  AddressCreate.onclick = function () {
    createAddress();
  };
  //model footer close button
  closeModalFooterBtn.onclick = function () {
    clearAddressCreateForm();
    modal.style.display = "none";
  };
  //on create button click
  plusIcon.addEventListener("click", function () {
    let phoneNumber = document.getElementById("phone").value;
    if (!phoneNumber) {
      alert("Please enter contact number");
      return;
    }
    var contactid = document.getElementById("contactid");
    modal.style.display = "block";
    clearAddressCreateForm();
    contactid.value = localStorage.getItem("clientId");
  });
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "block"; // Close the modal when clicked outside
    }
  };
});

function checkMobileNumber() {
  let mobileInput = document.getElementById("phone").value;
  let errorMessage = document.getElementById("error-message");
  let mobilePattern = /^05\d{8}$/;
  if (mobilePattern.test(mobileInput)) {
    errorMessage.style.display = "none";
    return true;
  } else {
    errorMessage.style.display = "block";
    return false;
  }
}

function getAddressByContactNumber() {
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("change", async function () {
      if (!checkMobileNumber()) return;
      const phoneNumber = phoneInput.value;
      const city = document.getElementById("city");
      const neighborhood = document.getElementById("neighborhood");
      showLoader();
      try {
        const response = await fetch(
          `https://mawaridmanpower.com:5001/api/Client/GetProfileByMobileNumber?MobileNumber=${phoneNumber}`,
          {
            method: "Get",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        hideLoader();
        if (data && data.code == 200 && data.content.mainAddress == null) {
          alert(
            "Warning: Address Information Not Found Please Create New Address"
          );
        }
        if(data && data.code == 200){
          localStorage.clear();
          localStorage.setItem("clientId", data.content.clientID);
        }
        if (data && data.code == 200 &&  data.content.mainAddress != null && data.content.mainAddress.addressTitle) {
          addressvalue.value = data.content.mainAddress.addressId;
          address.value = data.content.mainAddress.addressTitle;
          city.innerHTML = `<option value="${
            data.content.mainAddress.cityID
          }">${
            data.content.mainAddress.cityEn +
            "-" +
            data.content.mainAddress.cityAr
          }</option>`;
          neighborhood.innerHTML = `<option value="${
            data.content.mainAddress.neighbourhoodID
          }">${
            data.content.mainAddress.neighbourhoodEn +
            "-" +
            data.content.mainAddress.neighbourhoodAr
          }</option>`;
        } else if (data.code == 404) {
          registerUser(phoneNumber);
        }
      } catch (error) {
        hideLoader();
        alert(error);
      }
    });
  } else {
    console.error("Phone input field not found!");
  }
}
function changeLanguage(lang) {
  document.documentElement.lang = lang;
  document.body.dir = lang === "ar" ? "rtl" : "ltr";
}
async function registerUser(phoneNumber) {
  const apiUrl = `https://mawaridmanpower.com:5001/api/Client/NewRegister`;
  showLoader();
  try {
    const response = await fetch(apiUrl, {
      method: "Post",
      mode: "cors",
      body: JSON.stringify({
        mobileNumber: phoneNumber,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    hideLoader();
    if (data.code == 400 || data.code == 503) {
      alert(data.message);
      return;
    }
    if (data.content.clientID) {
      localStorage.setItem("clientId", data.content.clientID);
    }
  } catch (error) {
    hideLoader();
    alert(error);
  }
}
async function getMaintenanceCity() {
  const selectElement = document.getElementById("city");
  const apiUrl = `https://mawaridmanpower.com:5001/api/Address/GetMaintenanceCities`;
  showLoader();
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    hideLoader();
    const selectedValue = selectElement.value;
    selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select an option";
    selectElement.appendChild(defaultOption);

    data.content.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.cityID;
      option.textContent = item.cityEn + "-" + item.cityAr;
      selectElement.appendChild(option);
    });
    selectElement.value = selectedValue;
  } catch (error) {
    hideLoader();
    selectElement.innerHTML =
      '<option value="">Failed to load options</option>';
  }
}
async function getNeighbourHood() {
  const cityId = document.getElementById("city");
  const selectElement = document.getElementById("neighborhood");
  if (cityId.value == "") {
    alert("Please select city first");
    return;
  }
  const apiUrl = `https://mawaridmanpower.com:5001/api/Address/GetNeighbourhoodsByCity?cityid=${cityId.value}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.code == 404 || data.code == 503) {
      alert(data.message);
    }
    const selectedValue = selectElement.value;
    selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select an option";
    selectElement.appendChild(defaultOption);

    data.content.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.neighbourhoodID;
      option.textContent = item.neighbourhoodEn + "-" + item.neighbourhoodAr;
      selectElement.appendChild(option);
    });
    selectElement.value = selectedValue;
  } catch (error) {
    hideLoader();
    console.error("Error fetching data:", error);
    selectElement.innerHTML =
      '<option value="">Select City First and Try Again</option>';
  }
}
async function getServicesByAddressId() {
  const neighborHoodId = document.getElementById("neighborhood");
  const selectElement = document.getElementById("service");
  // if (neighborHoodId.value == "") {
  //   alert("Create address to proceed");
  //   return;
  // }
  const apiUrl = `https://mawaridmanpower.com:5001/api/General/GetAllServices?NeighborhoodID=${neighborHoodId.value}`;
  showLoader();
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    hideLoader();
    if (data.code == 200) {
      const selectedValue = selectElement.value;
      selectElement.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Select an option";
      selectElement.appendChild(defaultOption);
      data.content.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.serviceID;
        option.textContent = item.englishName;
        selectElement.appendChild(option);
      });
      selectElement.value = selectedValue;
    } else {
      alert(data.message);
    }
  } catch (error) {
    hideLoader();
    console.error("Error fetching data:", error);
    selectElement.innerHTML =
      '<option value="">Failed to load options</option>';
  }
}
let map;
let marker;
let lat;
let lng;
function initMap() {
  const center = { lat: 24.7136, lng: 46.6753 };
  map = new google.maps.Map(document.getElementById("map"), {
    center: center,
    zoom: 12,
  });
  map.addListener("click", function (event) {
    lat = event.latLng.lat();
    lng = event.latLng.lng();
    getCurrentNeighborHoodByLatLang(lat, lng);
    if (marker) {
      marker.setMap(null);
    }

    marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      title: `Selected Location: ${lat}, ${lng}`,
    });
  });
}
async function getCurrentNeighborHoodByLatLang(lat, lng) {
  const neighborHood = document.getElementById("createneighborhood");
  const city = document.getElementById("createcity");
  const apiUrl = `https://mawaridmanpower.com:5001/api/Address/GetCurrentNeighbourhood?Latitude=${lat}&Longitiude=${lng}`;
  showLoader();
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    hideLoader();
    if (data.code == 404) {
      alert(data.message);
      return;
    }
    neighborHood.innerHTML = '<option value="">Select Neighborhood</option>';
    city.innerHTML = '<option value="">Select City</option>';
    if (data.content.cityID) {
      city.innerHTML = "";
      city.innerHTML = `<option value="${data.content.cityID}">${
        data.content.cityEn + "-" + data.content.cityAr
      }</option>`;
    }
    if (data.content.neighbourhoodID) {
      neighborHood.innerHTML = "";
      neighborHood.innerHTML = `<option value="${
        data.content.neighbourhoodID
      }">${
        data.content.neighbourhoodEn + "-" + data.content.neighbourhoodAr
      }</option>`;
    }
  } catch (error) {
    hideLoader();
    console.error("Error fetching data:", error);
    city.innerHTML = '<option value="">Failed to load options</option>';
    neighborHood.innerHTML = '<option value="">Failed to load options</option>';
  }
}
async function createAddress() {
  const city = document.getElementById("createcity");
  const phonenumber = document.getElementById("phone");
  const contact = document.getElementById("contactid");
  const addresstitle = document.getElementById("addresstitle");
  const buildingno = document.getElementById("buildingno");
  // const preferedPhone = document.getElementById("preferedPhone");
  // const isMain = document.getElementById("isMain");
  const buildingType = document.getElementById("buildingType");
  const neighborhood = document.getElementById("createneighborhood");
  const apiUrl = `https://mawaridmanpower.com:5001/api/Address/AddAddress`;
  const data = {
    contactId: contact.value,
    addressTitle: addresstitle.value,
    cityID: city.value,
    neighbourhoodID: neighborhood.value,
    latitude: lat,
    longitude: lng,
    buildingNO: buildingno.value,
    preferedPhone: phonenumber.value,
    isMain: true,
    buildingType: buildingType.value,
  };
  if (
    !data.contactId ||
    !data.addressTitle ||
    !data.cityID ||
    !data.neighbourhoodID ||
    !data.latitude ||
    !data.longitude ||
    !data.buildingNO ||
    !data.preferedPhone ||
    !data.isMain ||
    !data.buildingType
  ) {
    alert("Please fill all fields");
    return;
  }
  showLoader();
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    hideLoader();
    if (responseData.code == 200) {
      alert("Address created successfully");
      document.getElementById("addressvalue").value =
        responseData.content.addressId;
      document.getElementById("address").value = addresstitle.value;
      document.getElementById("city").value = city.value;
      console.log(document.getElementById("createneighborhood").value);
      document.getElementById("neighborhood").innerHTML =
        neighborhood.innerHTML;
      document.getElementById("addressModal").style.display = "none";
    } else {
      alert(responseData.message);
    }
  } catch (error) {
    hideLoader();
    console.error("Error fetching data:", error);
  }
}
function showLoader() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("loader").style.display = "none";
}
function clearAddressCreateForm() {
  addresstitle.value = "";
  createcity.value = "";
  createneighborhood.value = "";
  buildingno.value = "";
  preferedPhone.value = "";
  isMain.checked = false;
  buildingType.value = "";
}

function clearRequestCreateForm() {
  localStorage.clear();
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";
  document.getElementById("addressvalue").value = "";
  document.getElementById("city").value = "";
  document.getElementById("neighborhood").value = "";
  document.getElementById("addressvalue").value = "";
  document.getElementById("visit-date").value = "";
  document.getElementById("visit-Time").value = "";
  document.getElementById("service").value = "";
  document.getElementById("noofitemstowork").value = "";
  document.getElementById("details").value = "";
  document.getElementById("haveTools").value = "";
}

async function createRequest() {
  const date = document.getElementById("visit-date").value;
  const time = document.getElementById("visit-Time").value;
  const combined = `${date}T${time}:00`;

  const apiUrl = `https://mawaridmanpower.com:5001/api/WorkOrder/CreateWorkOrderSadad`;
  const data = {
    customerID: localStorage.getItem("clientId"),
    customerAddressID: document.getElementById("addressvalue").value,
    service: document.getElementById("service").value,
    // document.getElementById("noofitemstowork").value
    numberOfItems: 1,
    // document.getElementById("details").value
    problemDescription: "From Website",
    startDate: combined,
    // document.getElementById("haveTools").value
    customerHasTools: true,
  };
  if(
    !data.customerID ||
    !data.customerAddressID ||
    !data.service ||  
    !data.numberOfItems ||
    !data.problemDescription ||
    !data.startDate ||
    !data.customerHasTools
  ) {
    alert("Please fill all fields");
    return;
  }
  showLoader();
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    hideLoader();
    if (responseData.code == 200) {
      alert(`Thanks for contacting us, Your request number is ${responseData.content.requestNo}`);
      clearRequestCreateForm();
    } else {
      alert(responseData.message);
    }
  } catch (error) {
    hideLoader();
    console.error("Error fetching data:", error);
  }
}
