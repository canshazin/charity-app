console.log("start of admin script");
const url = "http://localhost:3000";

const profile = document.querySelector("#profile");
const donations = document.querySelector("#donations");
const approvals = document.querySelector("#approvals");
const allUsers = document.querySelector("#allUsers");
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
    const user = await axios.get(`${url}/admin/profile`, {
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
              `${url}/admin/edit-profile`,
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

allUsers.addEventListener("click", async (event) => {
  searchBar.style.visibility = "visible";
  searchBar.value = "";
  const users = await axios.get(`${url}/admin/get-all-users`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  console.log(users.data);
  ul.innerHTML = "";

  users.data.forEach((user) => {
    addUsersToUi(user);
  });
});
function addUsersToUi(data) {
  console.log("in addusertoui function");
  const li = document.createElement("li");

  const span1 = document.createElement("span");
  span1.textContent = `User Name  : ${data.uname}`;

  const span2 = document.createElement("span");
  span2.textContent = `User Email : ${data.email}`;

  const spanAcc = document.createElement("span"); //for status of blocked or no for admin

  const block = document.createElement("button");
  block.textContent = "Block";
  block.dataset.id = data.id;

  const unblock = document.createElement("button");
  unblock.textContent = "Unblock";
  unblock.dataset.id = data.id;

  block.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const result = await axios.get(`${url}/admin/block-user?id=${data.id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (result.data.msg == "success") {
        alert("user blocked");
        spanAcc.textContent = `Account Status : Blocked`;
        block.style.display = "none";
        unblock.style.display = "block";
      }
    } catch (err) {
      console.log(err);
    }
  });

  unblock.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const result = await axios.get(
        `${url}/admin/unblock-user?id=${data.id}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (result.data.msg == "success") {
        alert("user unblocked");
        spanAcc.textContent = `Account Status : Active`;
        unblock.style.display = "none";
        block.style.display = "block";
      }
    } catch (err) {
      console.log(err);
    }
  });
  li.appendChild(span1);
  li.appendChild(span2);
  li.appendChild(spanAcc);
  li.appendChild(block);
  li.appendChild(unblock);
  console.log(li);
  console.log(ul);
  ul.appendChild(li);
  if (data.isBlocked == true) {
    spanAcc.textContent = `Account Status : Blocked`;
    block.style.display = "none";
    unblock.style.display = "block";
  } else if (data.isBlocked == false) {
    spanAcc.textContent = `Account Status : Active`;
    block.style.display = "block";
    unblock.style.display = "none";
  }
}

organizations.addEventListener("click", async (event) => {
  event.preventDefault();
  searchBar.style.visibility = "visible";
  searchBar.value = "";
  const user = await axios.get(`${url}/admin/get-all-organizations`, {
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
  const spanAcc = document.createElement("span"); //for status of blocked or no for admin

  const block = document.createElement("button");
  block.textContent = "Block";
  block.dataset.id = data.id;

  const unblock = document.createElement("button");
  unblock.textContent = "Unblock";
  unblock.dataset.id = data.id;

  block.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const result = await axios.get(
        `${url}/admin/block-organization?id=${data.id}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (result.data.msg == "success") {
        alert("organization blocked");
        spanAcc.textContent = `Account Status : Blocked`;

        block.style.display = "none";
        unblock.style.display = "block";
      }
    } catch (err) {
      console.log(err);
    }
  });

  unblock.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const result = await axios.get(
        `${url}/admin/unblock-organization?id=${data.id}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (result.data.msg == "success") {
        alert("organization unblocked");
        spanAcc.textContent = `Account Status : Active`;
        unblock.style.display = "none";
        block.style.display = "block";
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
  li.appendChild(spanAcc);
  li.appendChild(block);
  li.appendChild(unblock);

  console.log(li);
  console.log(ul);
  ul.appendChild(li);
  if (data.user.isBlocked == true) {
    spanAcc.textContent = `Account Status : Blocked`;
    block.style.display = "none";
    unblock.style.display = "block";
  } else if (data.user.isBlocked == false) {
    spanAcc.textContent = `Account Status : Active`;
    block.style.display = "block";
    unblock.style.display = "none";
  }
}
//
//
//
donations.addEventListener("click", async (event) => {
  event.preventDefault();
  searchBar.style.visibility = "visible";
  searchBar.value = "";
  const allDonations = await axios.get(`${url}/admin/get-all-donations`, {
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
//
//
//
//
//
approvals.addEventListener("click", async (event) => {
  event.preventDefault();
  searchBar.style.visibility = "visible";
  searchBar.value = "";
  const user = await axios.get(`${url}/admin/get-non-approved-organizations`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  console.log(user.data);
  ul.innerHTML = "";

  user.data.forEach((org) => {
    addNonApprovedOrganizationsToUi(org);
  });
});
function addNonApprovedOrganizationsToUi(data) {
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
  const spanAcc = document.createElement("span"); //for status of blocked or no for admin

  const block = document.createElement("button");
  block.textContent = "Approve";
  block.dataset.id = data.id;

  const unblock = document.createElement("button");
  unblock.textContent = "Reject";
  unblock.dataset.id = data.id;

  block.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const result = await axios.get(
        `${url}/admin/approve-organization?id=${data.id}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (result.data.msg == "success") {
        alert("organization approved");
        event.target.parentNode.remove();
      }
    } catch (err) {
      console.log(err);
    }
  });

  unblock.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const result = await axios.get(
        `${url}/admin/reject-organization?id=${data.id}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (result.data.msg == "success") {
        alert("organization Rejected");
        event.target.parentNode.remove();
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

  li.appendChild(block);
  li.appendChild(unblock);

  console.log(li);
  console.log(ul);
  ul.appendChild(li);
  // if (data.user.isBlocked == true) {
  //   spanAcc.textContent = `Account Status : Blocked`;
  //   block.style.display = "none";
  //   unblock.style.display = "block";
  // } else if (data.user.isBlocked == false) {
  //   spanAcc.textContent = `Account Status : Active`;
  //   block.style.display = "block";
  //   unblock.style.display = "none";
  // }
}
