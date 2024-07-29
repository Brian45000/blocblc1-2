describe("crud", () => {
  it("login", function () {
    cy.visit("http://localhost:5173");
    cy.get(".login-button").click();
    cy.get(".auth-toggle > :nth-child(2)").click();
    cy.get('[type="email"]').clear("e");
    cy.get('[type="email"]').type("email@email.fr");
    cy.get('[type="password"]').clear();
    cy.get('[type="password"]').type("Password");
    cy.get(".signin-form > button").click();
  });

  it("créer un véhicule", function () {
    cy.visit("http://localhost:5173");
    cy.get(".login-button").click();
    cy.get(".auth-toggle > :nth-child(2)").click();
    cy.get('[type="email"]').clear("e");
    cy.get('[type="email"]').type("email@email.fr");
    cy.get('[type="password"]').clear();
    cy.get('[type="password"]').type("Password");
    cy.get(".signin-form > button").click();

    cy.get('[placeholder="Marque"]').clear("R");
    cy.get('[placeholder="Marque"]').type("Renault");
    cy.get('[placeholder="Modèle"]').clear();
    cy.get('[placeholder="Modèle"]').type("Clio 4");
    cy.get('[placeholder="Immatriculation"]').clear();
    cy.get('[placeholder="Immatriculation"]').type("AA-BBB-CC");
    cy.get('[type="number"]').clear();
    cy.get('[type="number"]').type("2018");
    cy.get('[placeholder="Description"]').clear();
    cy.get('[placeholder="Description"]').type("Ma description");
    cy.get("select").select("2");
    cy.get(":nth-child(3) > button").click();
  });

  it("modifier un véhicule", function () {
    cy.visit("http://localhost:5173");
    cy.get(".login-button").click();
    cy.get(".auth-toggle > :nth-child(2)").click();
    cy.get('[type="email"]').clear("e");
    cy.get('[type="email"]').type("email@email.fr");
    cy.get('[type="password"]').clear();
    cy.get('[type="password"]').type("Password");
    cy.get(".signin-form > button").click();

    cy.get(":nth-child(12) > :nth-child(7) > :nth-child(1)").click();
    cy.get("tbody > :nth-child(12)").click();
    cy.get(":nth-child(1) > input").clear();
    cy.get(":nth-child(1) > input").type("Renault modifié");
    cy.get(":nth-child(2) > input").clear("Clio ");
    cy.get(":nth-child(2) > input").type("Clio 5");
    cy.get(":nth-child(12) > :nth-child(3) > input").clear();
    cy.get(":nth-child(12) > :nth-child(3) > input").type("AA-BBB-CC");
    cy.get(":nth-child(4) > input").clear();
    cy.get(":nth-child(4) > input").type("2023");
    cy.get(":nth-child(12) > :nth-child(5)").click();
    cy.get(":nth-child(5) > input").clear("de");
    cy.get(":nth-child(5) > input").type("description");
    cy.get(":nth-child(12) > :nth-child(7) > :nth-child(1)").click();
  });

  it("supprimer un véhicule", function () {
    cy.visit("http://localhost:5173");
    cy.get(".login-button").click();
    cy.get(".auth-toggle > :nth-child(2)").click();
    cy.get('[type="email"]').clear("e");
    cy.get('[type="email"]').type("email@email.fr");
    cy.get('[type="password"]').clear();
    cy.get('[type="password"]').type("Password");
    cy.get(".signin-form > button").click();
    cy.get(":nth-child(13) > :nth-child(7) > :nth-child(2)").click();
  });
});
