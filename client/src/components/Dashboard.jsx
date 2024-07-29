import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
const baseURI = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const [clientCount, setClientCount] = useState(0);
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    marque: "",
    modele: "",
    immatriculation: "",
    annee: "",
    description: "",
    client_id: "",
  });
  const [editVehicle, setEditVehicle] = useState(null);

  useEffect(() => {
    const fetchClientCount = async () => {
      try {
        const response = await fetch(baseURI + "api/clients/count", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setClientCount(data.count);
        } else {
          alert("Erreur lors de la récupération du nombre de clients");
          navigate("/");
        }
      } catch (error) {
        alert("Erreur réseau");
        navigate("/");
      }
    };

    const fetchVehicles = async () => {
      try {
        const response = await fetch(baseURI + "api/vehicles", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setVehicles(data);
        } else {
          alert("Erreur lors de la récupération des véhicules");
        }
      } catch (error) {
        alert("Erreur réseau");
      }
    };

    const fetchClients = async () => {
      try {
        const response = await fetch(baseURI + "api/clients", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
          alert("Erreur lors de la récupération des clients");
        }
      } catch (error) {
        alert("Erreur réseau");
      }
    };

    fetchClientCount();
    fetchVehicles();
    fetchClients();
  }, []);

  const handleAddVehicle = async () => {
    try {
      const response = await fetch(baseURI + "api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newVehicle),
      });
      if (response.ok) {
        setVehicles([...vehicles, newVehicle]);
        setNewVehicle({
          marque: "",
          modele: "",
          immatriculation: "",
          annee: "",
          description: "",
          client_id: "",
        });
      } else {
        alert("Erreur lors de l'ajout du véhicule");
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  const handleEditVehicle = async (id) => {
    try {
      const response = await fetch(baseURI + `api/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editVehicle),
      });
      if (response.ok) {
        setVehicles(
          vehicles.map((vehicle) => (vehicle.id === id ? editVehicle : vehicle))
        );
        setEditVehicle(null);
      } else {
        alert("Erreur lors de la modification du véhicule");
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  const handleDeleteVehicle = async (id) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce véhicule ?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(baseURI + `api/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
      } else {
        alert("Erreur lors de la suppression du véhicule");
      }
    } catch (error) {
      alert("Erreur réseau");
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Tableau de bord admin</h2>
      <p>Nombre de clients inscrits : {clientCount}</p>

      <div className="dashboard-card">
        <h3>Ajouter un véhicule</h3>
        <input
          type="text"
          placeholder="Marque"
          value={newVehicle.marque}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, marque: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Modèle"
          value={newVehicle.modele}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, modele: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Immatriculation"
          value={newVehicle.immatriculation}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, immatriculation: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Année"
          value={newVehicle.annee}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, annee: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Description"
          value={newVehicle.description}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, description: e.target.value })
          }
        />
        <select
          value={newVehicle.client_id}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, client_id: e.target.value })
          }
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.firstname} {client.lastname}
            </option>
          ))}
        </select>
        <button onClick={handleAddVehicle}>Ajouter véhicule</button>
      </div>
      <div className="dashboard-card">
        <h3>Liste des véhicules</h3>
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Immatriculation</th>
              <th>Année</th>
              <th>Description</th>
              <th>Client</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                {editVehicle && editVehicle.id === vehicle.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editVehicle.marque}
                        onChange={(e) =>
                          setEditVehicle({
                            ...editVehicle,
                            marque: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editVehicle.modele}
                        onChange={(e) =>
                          setEditVehicle({
                            ...editVehicle,
                            modele: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editVehicle.immatriculation}
                        onChange={(e) =>
                          setEditVehicle({
                            ...editVehicle,
                            immatriculation: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editVehicle.annee}
                        onChange={(e) =>
                          setEditVehicle({
                            ...editVehicle,
                            annee: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editVehicle.description}
                        onChange={(e) =>
                          setEditVehicle({
                            ...editVehicle,
                            description: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={editVehicle.client_id}
                        onChange={(e) =>
                          setEditVehicle({
                            ...editVehicle,
                            client_id: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner un client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.firstname} {client.lastname}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleEditVehicle(vehicle.id)}>
                        Enregistrer
                      </button>
                      <button onClick={() => setEditVehicle(null)}>
                        Annuler
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{vehicle.marque}</td>
                    <td>{vehicle.modele}</td>
                    <td>{vehicle.immatriculation}</td>
                    <td>{vehicle.annee}</td>
                    <td>{vehicle.description}</td>
                    <td>
                      {vehicle.firstname} {vehicle.lastname}
                    </td>
                    <td>
                      <button onClick={() => setEditVehicle(vehicle)}>
                        Modifier
                      </button>
                      <button onClick={() => handleDeleteVehicle(vehicle.id)}>
                        Supprimer
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
