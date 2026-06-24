export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const emptyResource = {
  resource_name: "",
  department: "IT",
  classification: 1,
};

export const emptyUser = {
  name: "",
  email: "",
  password: "",
  department: "IT",
  clearance_level: 1,
  location: "Office",
  role_id: "",
  status: "Active",
};
