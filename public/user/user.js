console.log("start of user script");
const url = "http://localhost:3000";

const profile = document.querySelector("#profile");
const donations = document.querySelector("#donations");
const organizations = document.querySelector("#organizations");
const updates = document.querySelector("#updates");
const searchBar = document.querySelector("#searchBar");
const logout = document.querySelector("#logout");

const ul = document.querySelector("#plist");

searchBar.addEventListener("keyup", function () {
  const searchTerm = this.value.toLowerCase().trim();
  const items = ul.getElementsByTagName("li");

  for (let item of items) {
    const spans = item.getElementsByTagName("span");
    let found = false;

    for (let span of spans) {
      if (span.textContent.toLowerCase().includes(searchTerm)) {
        found = true;
        break;
      }
    }

    item.style.display = found ? "" : "none";
  }
});

profile.addEventListener("click", async (event) => {
  try {
    event.preventDefault();
    searchBar.style.visibility = "hidden";
    searchBar.value = "";
    const user = await axios.get(`${url}/user/profile`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    console.log(user.data);
    ul.innerHTML = "";
    const li = document.createElement("li");

    const span1 = document.createElement("span");
    span1.textContent = `User Name : ${user.data.uname}`;
    const span2 = document.createElement("span");
    span2.textContent = `User Email : ${user.data.email}`;
    const button = document.createElement("button");
    button.textContent = "Edit Profile";
    button.dataset.email = user.data.email;
    button.dataset.uname = user.data.uname;
    li.appendChild(span1);
    li.appendChild(span2);
    li.appendChild(button);
    ul.appendChild(li);
    ul.style.display = "block";

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log(event.target);
      ul.innerHTML = "";

      const unameLabel = document.createElement("label");
      unameLabel.setAttribute("for", "uname");
      unameLabel.textContent = "User Name:";
      unameLabel.classList.add("input-label"); // Add class for styling

      const unameInput = document.createElement("input");
      unameInput.setAttribute("type", "uname");
      unameInput.setAttribute("id", "uname");
      unameInput.setAttribute("name", "uname");

      unameInput.value = event.target.dataset.uname;
      unameInput.classList.add("input-field"); // Add class for styling

      const emailLabel = document.createElement("label");
      emailLabel.setAttribute("for", "email");
      emailLabel.textContent = "Email:";
      emailLabel.classList.add("input-label"); // Add class for styling

      const emailInput = document.createElement("input");
      emailInput.setAttribute("type", "email");
      emailInput.setAttribute("id", "email");
      emailInput.setAttribute("name", "email");

      emailInput.value = event.target.dataset.email;
      emailInput.classList.add("input-field"); // Add class for styling

      ul.appendChild(unameLabel);
      ul.appendChild(unameInput);
      ul.appendChild(emailLabel);
      ul.appendChild(emailInput);
      const changeButton = document.createElement("button");
      changeButton.textContent = "Change";
      changeButton.dataset.email = event.target.dataset.email;
      changeButton.addEventListener("click", async (event) => {
        try {
          event.preventDefault();
          if (unameInput.value.length > 0 && emailInput.value.length > 0) {
            const newProfile = {
              uname: unameInput.value,
              email: emailInput.value,
            };

            const result = await axios.put(
              `${url}/user/edit-profile`,
              newProfile,
              {
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              }
            );
            console.log(result.data);
            if (result.data.success == false) {
              alert("Username updated..." + result.data.msg);
            } else {
              alert(result.data.msg);
              window.location.reload();
            }
          }
        } catch (err) {
          console.log(err);
          alert("smthing went wrong");
        }
      });

      ul.appendChild(changeButton);
    });
  } catch (err) {
    console.log(err);
    alert("smthing went wrong");
  }
});
async function transactionFail(order_id, payment_id) {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:3000/user/failedTransaction",
      {
        order_id: order_id,
        payment_id: payment_id,
      },
      { headers: { Authorization: token } }
    );
  } catch (err) {
    console.log(err);
  }
}

organizations.addEventListener("click", async (event) => {
  event.preventDefault();
  searchBar.style.visibility = "visible";
  searchBar.value = "";
  const user = await axios.get(`${url}/user/organizations`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  console.log(user.data);
  ul.innerHTML = "";

  user.data.forEach((org) => {
    addOrganizationsToUi(org);
  });
});
function addOrganizationsToUi(data) {
  console.log("data", data);
  const li = document.createElement("li");

  const span1 = document.createElement("span");
  span1.textContent = `Organization Name  : ${data.oname}`;

  const span2 = document.createElement("span");
  span2.textContent = `Mission : ${data.mission}`;

  const span3 = document.createElement("span");
  span3.textContent = `Description : ${data.description}`;

  const span4 = document.createElement("span");
  span4.textContent = `Location : ${data.location}`;

  const span5 = document.createElement("span");
  span5.textContent = `Contact Email : ${data.contactEmail}`;
  const span6 = document.createElement("span");
  span6.textContent = `Goal amount : ${data.goal}`;
  const span7 = document.createElement("span");
  span7.textContent = `Total amount received : ${data.amount}`;

  const donateInput = document.createElement("input");
  donateInput.setAttribute("type", "number");
  donateInput.setAttribute("id", "donateInput");
  donateInput.setAttribute("name", "donateInput");

  donateInput.placeholder = "Enter amount ...Not more than Rs 50,000";
  donateInput.classList.add("input-field"); // Add class for styling

  const button = document.createElement("button");
  button.textContent = "Donate";
  button.dataset.oid = data.id;

  button.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      if (donateInput.value.length > 0 && donateInput.value <= 50000) {
        console.log(event.target);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/user/donate?amount=${donateInput.value}&oid=${event.target.dataset.oid}`,
          { headers: { Authorization: token } }
        );
        console.log(response);
        var options = {
          key: response.data.key_id,
          order_id: response.data.order.id,
          handler: async function (response) {
            const res = await axios.post(
              "http://localhost:3000/user/updatetransactionstatus",
              {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
              },
              { headers: { Authorization: token } }
            );

            console.log(res);
            alert("Transaction successfull");
          },
        };
        const rzp1 = new Razorpay(options);
        rzp1.open();
        event.preventDefault();

        rzp1.on("payment.failed", function (response) {
          transactionFail(
            response.error.metadata.order_id,
            response.error.metadata.payment_id
          );

          console.log(response.error.metadata);
        });
      } else {
        alert("Enter valid amount");
      }
    } catch (err) {
      console.log(err);
    }
  });

  li.appendChild(span1);
  li.appendChild(span2);
  li.appendChild(span3);
  li.appendChild(span4);
  li.appendChild(span5);
  li.appendChild(span6);
  li.appendChild(span7);
  li.appendChild(donateInput);

  li.appendChild(button);
  ul.appendChild(li);
  ul.style.display = "block";

donations.addEventListener("click", async (event) => {
  event.preventDefault();
  searchBar.style.visibility = "visible";
  searchBar.value = "";
  const allDonations = await axios.get(`${url}/user/get-all-donations`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  console.log(allDonations.data);
  ul.innerHTML = "";
  allDonations.data.forEach((donation) => {
    addDonationsToUi(donation);
  });
});
function addDonationsToUi(data) {
  const li = document.createElement("li");

  const span1 = document.createElement("span");
  span1.textContent = `From  : ${data.user.uname}(${data.user.email})`;

  const span2 = document.createElement("span");
  span2.textContent = `To : ${data.organization.oname}(${data.organization.contactEmail})`;

  const span3 = document.createElement("span");
  span3.textContent = `Amount : Rs ${data.amount}`;

  const span4 = document.createElement("span");
  span4.textContent = `payment id : ${data.paymentId}`;

  const span5 = document.createElement("span");
  span5.textContent = `status : ${data.status}`;

  const span6 = document.createElement("span");
  const date = new Date(data.createdAt).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  span6.textContent = `date : ${date}`;

  const link = document.createElement("a");
  link.href = data.url; // S3 image URL
  link.target = "_blank"; // Open in new tab
  link.style.display = "none"; // Hide the anchor element

  const button = document.createElement("button");
  button.innerText = "Download Receipt";
  button.addEventListener("click", function () {
    link.click(); // Simulate clicking the link
  });
  const viewUpdate = document.createElement("button");
  viewUpdate.dataset.did = data.id;
  viewUpdate.innerText = "Check  for  Update ";
  let check = 0;
  viewUpdate.addEventListener("click", async (event) => {
    try {
      event.preventDefault();

      const allUpdates = await axios.get(
        `${url}/user/get-all-updates?did=${data.id}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      console.log(allUpdates.data);

      if (allUpdates.data.length == 0) {
        alert("No updates...");
      } else {
        // ul.innerHTML = "";
        const liMsg = document.createElement("li");
        if (check == 0) {
          allUpdates.data.forEach((update) => {
            const span = document.createElement("span");
            span.innerHTML = `
  <span style="color:#2980b9;">
    ${new Date(update.createdAt).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })}
  </span> ${update.msg}
`;
            liMsg.appendChild(span);

            console.log(event.target.parentNode);

            // ul.appendChild(liMsg);
          });
          event.target.parentNode.appendChild(liMsg);
          check = 1;
        } else {
          check = 0;
          event.target.parentNode.lastChild.remove();
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  li.appendChild(span1);
  li.appendChild(span2);
  li.appendChild(span3);
  li.appendChild(span4);
  li.appendChild(span5);
  li.appendChild(span6);

  li.appendChild(button);
  li.appendChild(viewUpdate);
  ul.appendChild(li);
  ul.style.display = "block";
}
logout.addEventListener("click", (event) => {
  event.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "../login/login.html";
});
window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();
  organizations.click();
});
