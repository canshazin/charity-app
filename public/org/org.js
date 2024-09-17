console.log("start of org script");
const url = "http://localhost:3000";

const profile = document.querySelector("#profile");
const donations = document.querySelector("#donations");
const donationsRec = document.querySelector("#donationsRec");
const organizations = document.querySelector("#organizations");
const updates = document.querySelector("#updates");
const logout = document.querySelector("#logout");

const ul = document.querySelector("#plist");

profile.addEventListener("click", async (event) => {
  try {
    event.preventDefault();
    const user = await axios.get(`${url}/org/profile`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    console.log(user.data);
    ul.innerHTML = "";
    const li = document.createElement("li");

    const span1 = document.createElement("span");
    span1.textContent = `Organization Name  : ${user.data.oname}`;

    const span2 = document.createElement("span");
    span2.textContent = `Mission : ${user.data.mission}`;

    const span3 = document.createElement("span");
    span3.textContent = `Description : ${user.data.description}`;

    const span4 = document.createElement("span");
    span4.textContent = `Location : ${user.data.location}`;

    const span5 = document.createElement("span");
    span5.textContent = `Contact Email : ${user.data.contactEmail}`;
    const span6 = document.createElement("span");
    span6.textContent = `Goal amount : ${user.data.goal}`;
    const button = document.createElement("button");
    button.textContent = "Edit Profile";
    button.dataset.email = user.data.contactEmail;
    button.dataset.oname = user.data.oname;
    li.appendChild(span1);
    li.appendChild(span2);
    li.appendChild(span3);
    li.appendChild(span4);
    li.appendChild(span5);
    li.appendChild(span6);
    li.appendChild(button);
    ul.appendChild(li);
    ul.style.display = "block";

    button.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log(event.target);
      ul.innerHTML = "";

      const onameLabel = document.createElement("label");
      onameLabel.setAttribute("for", "oname");
      onameLabel.textContent = "Organization Name:";
      onameLabel.classList.add("input-label"); // Add class for styling

      const onameInput = document.createElement("input");
      onameInput.setAttribute("type", "text");
      onameInput.setAttribute("id", "oname");
      onameInput.setAttribute("name", "oname");

      onameInput.value = user.data.oname;
      onameInput.classList.add("input-field"); // Add class for styling

      const emailLabel = document.createElement("label");
      emailLabel.setAttribute("for", "email");
      emailLabel.textContent = "Email:";
      emailLabel.classList.add("input-label"); // Add class for styling

      const emailInput = document.createElement("input");
      emailInput.setAttribute("type", "email");
      emailInput.setAttribute("id", "email");
      emailInput.setAttribute("name", "email");

      emailInput.value = user.data.contactEmail;
      emailInput.classList.add("input-field"); // Add class for styling

      const locationLabel = document.createElement("label");
      locationLabel.setAttribute("for", "location");
      locationLabel.textContent = "Location:";
      locationLabel.classList.add("input-label"); // Add class for styling

      const locationInput = document.createElement("input");
      locationInput.setAttribute("type", "text");
      locationInput.setAttribute("id", "location");
      locationInput.setAttribute("name", "location");

      locationInput.value = user.data.location;
      locationInput.classList.add("input-field"); // Add class for styling
      // Description
      const descriptionLabel = document.createElement("label");
      descriptionLabel.setAttribute("for", "description");
      descriptionLabel.textContent = "Description:";
      descriptionLabel.classList.add("input-label");

      const descriptionInput = document.createElement("input");
      descriptionInput.setAttribute("type", "text");
      descriptionInput.setAttribute("id", "description");
      descriptionInput.setAttribute("name", "description");
      descriptionInput.value = user.data.description;
      descriptionInput.classList.add("input-field");

      // Mission
      const missionLabel = document.createElement("label");
      missionLabel.setAttribute("for", "mission");
      missionLabel.textContent = "Mission:";
      missionLabel.classList.add("input-label");

      const missionInput = document.createElement("input");
      missionInput.setAttribute("type", "text");
      missionInput.setAttribute("id", "mission");
      missionInput.setAttribute("name", "mission");
      missionInput.value = user.data.mission;
      missionInput.classList.add("input-field");

      // Goal
      const goalLabel = document.createElement("label");
      goalLabel.setAttribute("for", "goal");
      goalLabel.textContent = "Goal:";
      goalLabel.classList.add("input-label");

      const goalInput = document.createElement("input");
      goalInput.setAttribute("type", "text");
      goalInput.setAttribute("id", "goal");
      goalInput.setAttribute("name", "goal");
      goalInput.value = user.data.goal;
      goalInput.classList.add("input-field");

      ul.appendChild(onameLabel);
      ul.appendChild(onameInput);

      ul.appendChild(emailLabel);
      ul.appendChild(emailInput);

      ul.appendChild(locationLabel);
      ul.appendChild(locationInput);

      ul.appendChild(descriptionLabel);
      ul.appendChild(descriptionInput);

      ul.appendChild(missionLabel);
      ul.appendChild(missionInput);

      ul.appendChild(goalLabel);
      ul.appendChild(goalInput);
      const changeButton = document.createElement("button");
      changeButton.textContent = "Change";
      changeButton.dataset.email = event.target.dataset.email;
      changeButton.addEventListener("click", async (event) => {
        try {
          event.preventDefault();
          if (onameInput.value.length > 0 && emailInput.value.length > 0) {
            const newProfile = {
              oname: onameInput.value,
              email: emailInput.value,
              location: locationInput.value,
              mission: missionInput.value,
              description: descriptionInput.value,
              goal: goalInput.value,
            };

            const result = await axios.put(
              `${url}/org/edit-profile`,
              newProfile,
              {
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              }
            );
            console.log(result.data);
            if (result.data.success == false) {
              alert(result.data.msg + "Other fields aupdated");
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
  // li.addEventListener("click", async (event) => {
  //   event.preventDefault();
  //   newpage(li);
  // });
}
donations.addEventListener("click", async (event) => {
  event.preventDefault();
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
donationsRec.addEventListener("click", async (event) => {
  event.preventDefault();
  const allDonations = await axios.get(`${url}/user/get-received-donations`, {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  });
  console.log(allDonations.data);
  ul.innerHTML = "";
  allDonations.data.forEach((donation) => {
    addReceivedDonationsToUi(donation);
  });
});
function addReceivedDonationsToUi(data) {
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
  viewUpdate.innerText = "Updates Sent";
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
  const updateLabel = document.createElement("label");
  updateLabel.setAttribute("for", "update");
  updateLabel.classList.add("input-label");
  const updateInput = document.createElement("textarea");
  updateInput.setAttribute("id", "update");
  updateInput.setAttribute("rows", "10");
  updateInput.setAttribute("cols", "50");
  updateInput.placeholder = "send message to your donor...";

  //   updateInput.classList.add("input-label");
  const newLi = document.createElement("li");
  newLi.appendChild(updateLabel);
  newLi.appendChild(updateInput);

  const sendUpdate = document.createElement("button");
  sendUpdate.textContent = "Send Update";
  sendUpdate.dataset.did = data.id;

  newLi.appendChild(sendUpdate);
  sendUpdate.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const content = { msg: updateInput.value, did: data.id };
      if (updateInput.value.length > 0) {
        const updateStatus = await axios.post(
          `${url}/user/send-update`,
          content,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        if (updateStatus.data.success == true) {
          alert("successfully submitted");
          updateInput.value = "";
        }
      } else {
        alert("type in the text box..");
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
  li.appendChild(newLi);
  li.appendChild(button);
  li.appendChild(viewUpdate);

  ul.appendChild(li);
  ul.style.display = "block";
}
