console.log("start of signupOrg script");
const url = "http://localhost:3000";
const signup = document.querySelector("#signup");
const user_name = document.querySelector("#user_name");
const user_email = document.querySelector("#user_email");
const user_password = document.querySelector("#user_password");

const user_desc = document.querySelector("#user_desc");
const user_loc = document.querySelector("#user_loc");
const user_miss = document.querySelector("#user_miss");
const user_goal = document.querySelector("#user_goal");

const warning = document.querySelector("#warning");
signup.addEventListener("submit", async (event) => {
  try {
    event.preventDefault();

    const user = {
      uname: user_name.value,
      email: user_email.value,
      password: user_password.value,
      description: user_desc.value,
      location: user_desc.value,
      mission: user_miss.value,
      goal: user_goal.value,
    };
    const result = await axios.post(`${url}/org/signup`, user);
    console.log(result.data);
    alert(result.data.msg);
  } catch (err) {
    console.log(err);
  }
});
