// In index.js
const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const createAuthRouter = require("./router/auth_users.js");
const general_routes = require("./router/general.js").general;

const app = express();

const PORT = 5000;

const customerRoutes = createAuthRouter(session);

app.use(express.json());
app.use("/", general_routes);
app.use("/customer", customerRoutes);

app.listen(PORT, () => console.log("Server is running"));
