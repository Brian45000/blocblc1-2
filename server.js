const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const csrf = require("csrf");
const tokens = new csrf();

const app = express();
const port = 3000;
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
// Middleware

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  })
);

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "dev",
  password: "",
  database: "garage_db_deux",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});
const verifyTokenAndRole = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("Access Denied: No Token Provided!");
  }
  const roles = req.requiredroles || ["admin", "client"];
  try {
    const decoded = jwt.verify(token, "OEKFNEZKkF78EZFH93023NOEAF");
    req.user = decoded;
    const sql = "SELECT role FROM users WHERE id = ?";
    db.query(sql, [req.user.id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Server error");
      }

      if (results.length === 0) {
        return res.status(404).send("User not found");
      }

      const userRole = results[0].role;
      if (!roles.includes(userRole)) {
        return res
          .status(403)
          .send("Access Denied: You do not have the required role!");
      }

      next();
    });
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
};

// Middleware pour vérifier le rôle de l'utilisateur
const checkAdminRole = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("Access Denied: No Token Provided!");
  }

  const roles = req.requiredroles || ["admin"];
  try {
    const decoded = jwt.verify(token, "OEKFNEZKkF78EZFH93023NOEAF");
    req.user = decoded;
    const sql = "SELECT role FROM users WHERE id = ?";
    db.query(sql, [req.user.id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Server error");
      }

      if (results.length === 0) {
        return res.status(404).send("User not found");
      }

      const userRole = results[0].role;
      if (!roles.includes(userRole)) {
        return res
          .status(403)
          .send("Access Denied: You do not have the required role!");
      }

      next();
    });
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
};

app.get("/csrf", function (req, res) {
  const token = tokens.create("OEKFNEZKkF78E");
  res.status(200).send({
    status: 200,
    message: "CSRF récupéré",
    token: token,
  });
});

// Routes
app.post("/api/signup", (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword);
  const sql =
    "INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?)";
  db.query(sql, [lastname, firstname, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(201).send("User registered");
  });
});

app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("User not found");
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send("Invalid password");
      return;
    }

    const token = jwt.sign({ id: user.id }, "OEKFNEZKkF78EZFH93023NOEAF", {
      expiresIn: 86400,
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 86400000 }); // 86400000 ms = 24 heures

    res.status(200).send({ auth: true, role: user.role });
  });
});

app.get(
  "/api/clients/count",
  (req, _res, next) => {
    req.requiredroles = ["admin"];
    next();
  },
  verifyTokenAndRole,
  (req, res) => {
    const sql = "SELECT COUNT(*) AS count FROM users WHERE role = ?";
    db.query(sql, ["client"], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
        return;
      }

      res.status(200).json(results[0]);
    });
  }
);

app.get(
  "/api/clients",
  (req, _res, next) => {
    req.requiredroles = ["admin"];
    next();
  },
  checkAdminRole,
  (req, res) => {
    const sql =
      "SELECT id, firstname, lastname FROM users WHERE role = 'client'";
    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).json(results);
    });
  }
);

app.get(
  "/api/vehicles",
  (req, _res, next) => {
    req.requiredroles = ["admin"];
    next();
  },
  checkAdminRole,
  (req, res) => {
    const sql = `
    SELECT v.id, v.marque, v.modele, v.immatriculation, v.annee, v.description, v.client_id, u.firstname, u.lastname
    FROM vehicles v
    LEFT JOIN users u ON v.client_id = u.id
  `;
    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).json(results);
    });
  }
);

app.post(
  "/api/vehicles",
  (req, _res, next) => {
    req.requiredroles = ["admin"];
    next();
  },
  checkAdminRole,
  (req, res) => {
    const {
      marque,
      modele,
      immatriculation,
      annee,
      description,
      client_id,
      csrfToken,
    } = req.body;

    console.log("MARQUE :", req.body.marque);
    const secret = "OEKFNEZKkF78E";
    console.log("TOKEN :", csrfToken);
    console.log("TOKENS :", tokens.verify(secret, `${csrfToken}`));
    if (!csrfToken || !tokens.verify(secret, `${csrfToken}`)) {
      return res.status(403).send("Invalid CSRF Token");
    }

    const sql =
      "INSERT INTO vehicles (marque, modele, immatriculation, annee, description, client_id) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [
        marque,
        modele,
        immatriculation,
        annee,
        description ? description : null,
        client_id ? client_id : null,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Server error");
          return;
        }
        res.status(201).send("Véhicule ajouté");
      }
    );
  }
);

app.put(
  "/api/vehicles/:id",
  (req, _res, next) => {
    req.requiredroles = ["admin"];
    next();
  },
  checkAdminRole,
  (req, res) => {
    const { id } = req.params;
    const { marque, modele, immatriculation, annee, description, client_id } =
      req.body;
    const sql =
      "UPDATE vehicles SET marque = ?, modele = ?, immatriculation = ?, annee = ?, description = ?, client_id = ? WHERE id = ?";
    db.query(
      sql,
      [
        marque,
        modele,
        immatriculation,
        annee,
        description ? description : null,
        client_id,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Server error");
          return;
        }
        res.status(200).send("Véhicule mis à jour");
      }
    );
  }
);

app.delete(
  "/api/vehicles/:id",
  (req, _res, next) => {
    req.requiredroles = ["admin"];
    next();
  },
  checkAdminRole,
  (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM vehicles WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).send("Véhicule supprimé");
    });
  }
);

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
