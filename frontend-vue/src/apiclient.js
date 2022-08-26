import { ref, watch } from "vue";

export const isLoggedIn = ref(false);

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
