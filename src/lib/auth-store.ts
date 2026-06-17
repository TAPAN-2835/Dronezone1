import { useState, useEffect } from "react";

export type VerificationStatus =
  | "Pending Verification"
  | "Approved"
  | "Rejected"
  | "Additional Documents Required";

export interface ProviderUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  govId: string;
  certifications: string;
  professionalDocs: string;
  businessName?: string;
  serviceCategories: string;
  experienceDetails: string;
  status: VerificationStatus;
  createdAt: string;
}

const STORAGE_KEY = "dronezone_providers";
const CURRENT_USER_KEY = "dronezone_current_user";

// Initial demo user so they can login directly for demo purposes
const DEMO_USER: ProviderUser = {
  id: "PRV-1000",
  fullName: "Rahul Sharma",
  email: "provider@dronezone.com",
  phone: "+91 98765 43210",
  address: "12, MG Road, Bengaluru, KA 560001",
  govId: "AADHAAR-1234",
  certifications: "DGCA Certified Pilot",
  professionalDocs: "Yes",
  businessName: "SkyFix Drone Services",
  serviceCategories: "Repair, Maintenance",
  experienceDetails: "5 years",
  status: "Approved",
  createdAt: new Date().toISOString(),
};

export function getStoredProviders(): ProviderUser[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}

  // Return demo user initially
  return [DEMO_USER];
}

export function saveStoredProviders(providers: ProviderUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
  // dispatch an event so hooks can re-render
  window.dispatchEvent(new Event("providers_updated"));
}

export function getCurrentUserEmail(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserEmail(email: string | null) {
  if (email) {
    localStorage.setItem(CURRENT_USER_KEY, email);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function useAuth() {
  const [providers, setProviders] = useState<ProviderUser[]>([]);
  const [currentUserEmail, setCurrentUserEmailState] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      setProviders(getStoredProviders());
      setCurrentUserEmailState(getCurrentUserEmail());
    }

    load();
    window.addEventListener("providers_updated", load);
    return () => window.removeEventListener("providers_updated", load);
  }, []);

  const currentUser = providers.find((p) => p.email === currentUserEmail) || null;

  const registerProvider = (providerData: Omit<ProviderUser, "id" | "status" | "createdAt">) => {
    const allProviders = getStoredProviders();
    if (allProviders.find((p) => p.email === providerData.email)) {
      throw new Error("Email already registered");
    }

    const newProvider: ProviderUser = {
      ...providerData,
      id: `PRV-${1000 + allProviders.length}`,
      status: "Pending Verification",
      createdAt: new Date().toISOString(),
    };

    saveStoredProviders([...allProviders, newProvider]);
    return newProvider;
  };

  const login = (email: string) => {
    const allProviders = getStoredProviders();
    const user = allProviders.find((p) => p.email === email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    setCurrentUserEmail(email);
    setCurrentUserEmailState(email);
    return user;
  };

  const logout = () => {
    setCurrentUserEmail(null);
    setCurrentUserEmailState(null);
  };

  const updateProviderStatus = (id: string, status: VerificationStatus) => {
    const allProviders = getStoredProviders();
    const updated = allProviders.map((p) => (p.id === id ? { ...p, status } : p));
    saveStoredProviders(updated);
  };

  return {
    providers,
    currentUser,
    registerProvider,
    login,
    logout,
    updateProviderStatus,
  };
}
