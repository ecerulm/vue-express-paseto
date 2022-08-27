import { ref, watch } from "vue";
import { flashes } from "@/flashes.js";
import router from "@/routes.js";

export const isLoggedIn = ref(false);
export const username = ref(null);

watch(isLoggedIn, async (currentlyLoggedIn, oldValue) => {
  if (currentlyLoggedIn) {
    router.push("/");
  } else {
    router.push("/notloggedin");
  }
});

export function updateLoggedInStatus() {
  const authToken = localStorage.getItem("authToken");

  fetch("http://localhost:3000/api/userinfo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
      "X-Requested-With": "fetch",
    },
    credentials: "omit",
    cache: "no-store",
  })
    .then((res) => res.json())
    .then((body) => {
      console.log("userinfo response", body);
      isLoggedIn.value = Boolean(body.loggedInStatus);
      username.value = body.username;
    })
    .catch((err) => {
      isLoggedIn.value = Boolean(false);
    });
}

export function login(username, password) {
  console.log("login called", username);
  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "fetch",
    },
    body: JSON.stringify({ username, password }),
    credentials: "omit",
    cache: "no-store",
  })
    .then((res) => res.json())
    .then((body) => {
      {
        if (!body.token) {
          flashes.push(`Login failed ${body.message}`);
          console.log("flashes", flashes);
        }
        console.log("login response", body);
        localStorage.setItem("authToken", body.token);
        updateLoggedInStatus();
      }
    })
    .catch((err) => {
      console.log("login error", err);
      updateLoggedInStatus();
    });
}

export function logout() {
  localStorage.removeItem("authToken");
  isLoggedIn.value = false;
}
