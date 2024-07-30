import Dashboard from "../src/components/Dashboard";
import { act, cleanup, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

describe("Vehicules Component", () => {
  beforeEach(() => {
    cleanup();
    global.alert = vi.fn();
  });

  it("should render the Vehicules component correctly", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText("Liste des véhicules")).to.exist;
  });

  it("should render Ajouter un véhicule button", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByText("Ajouter un véhicule")).to.exist;
  });

  it("should render vehicule-table", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    const tableElement = screen.getByRole("table");
    expect(tableElement).toBeInTheDocument();
  });
});
