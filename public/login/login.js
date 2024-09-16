const url = "http://localhost:3000";
console.log("start of login script");
const login = document.querySelector("#login");
const forgot_password_btn = document.querySelector("#forgot_password_btn");
const user_name = document.querySelector("#user_name");
const user_email = document.querySelector("#user_email");
const user_password = document.querySelector("#user_password");
const warning = document.querySelector("#warning");

login.addEventListener("submit", async (event) => {
  try {
    event.preventDefault();
    warning.innerHTML = "";
    const user = { email: user_email.value, password: user_password.value };
    const result = await axios.post(`${url}/user/login`, user);

    const result_data = result.data;

    if (result_data.success == true) {
      alert(`${result_data.message}`);
      console.log(result_data.token);
      localStorage.setItem("token", result_data.token);
      // window.location.href = "../expense/expense.html";
      // await axios.get(`${url}/user/role-redirect`, {
      //   headers: {
      //     Authorization: localStorage.getItem("token"),
      //   },
      // });

      console.log("logged successfully");
      if (result.data.role == "admin") {
        window.location.href = "../admin/admin.html";
      } else if (result.data.role == "org") {
        window.location.href = "../org/org.html";
      } else if (result.data.role == "user") {
        window.location.href = "../user/user.html";
      }
    } else {
      warning.innerHTML += `${result_data.message}`;
    }
  } catch (err) {
    console.log(err);
    if (err.response.status == 401 || err.response.status == 404)
      warning.innerHTML += `${err.response.data.message}`;
  }
});
forgot_password_btn.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "../forgotPassword/forgot_password.html";
});
