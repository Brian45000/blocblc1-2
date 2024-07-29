const request = require("supertest");
const app = require("../server"); // Importer le serveur existant
const jwt = require("jsonwebtoken");

describe("Tests sur les appels API", () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ id: 1, role: "admin" }, "OEKFNEZKkF78EZFH93023NOEAF", {
      expiresIn: "1h",
    });
  });

  it("devrait récupérer la liste des véhicules", async () => {
    const res = await request(app)
      .get("/api/vehicles")
      .set("x-access-token", token);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 10000);

  it("devrait récupérer la liste des clients", async () => {
    const res = await request(app)
      .get("/api/clients")
      .set("x-access-token", token);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 10000);

  it("devrait créer un véhicule", async () => {
    const vehicle = {
      marque: "Honda",
      modele: "Civic",
      immatriculation: "ABC-123",
      annee: 2021,
      client_id: 1,
    };

    const res = await request(app)
      .post("/api/vehicles")
      .set("x-access-token", token)
      .send(vehicle);
    expect(res.statusCode).toEqual(201);
  }, 10000);

  it("devrait mettre un jour un véhicule", async () => {
    const updatedVehicle = {
      marque: "Honda",
      modele: "Accord",
      immatriculation: "XYZ-789",
      annee: 2022,
      client_id: 1,
    };

    const res = await request(app)
      .put("/api/vehicles/12")
      .set("x-access-token", token)
      .send(updatedVehicle);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("Véhicule mis à jour");
  }, 10000);

  it("devrait supprimer un véhicule", async () => {
    const res = await request(app)
      .delete("/api/vehicles/12")
      .set("x-access-token", token);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("Véhicule supprimé");
  }, 10000);
});
