fetch("https://subscription-tracker-fullstack.onrender.com/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Test User",
    email: "test@example.com",
    password: "password123"
  })
}).then(res => res.json().then(data => console.log(res.status, data)))
  .catch(err => console.error(err));
