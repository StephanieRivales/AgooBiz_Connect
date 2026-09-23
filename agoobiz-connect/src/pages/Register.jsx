import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

// Rough bounding box for Agoo, La Union — used only as a soft, non-blocking warning.
const AGOO_BOUNDS = { minLat: 16.26, maxLat: 16.40, minLng: 120.30, maxLng: 120.44 };

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [barangay, setBarangay] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [location, setLocation] = useState(null); // { lat, lng }
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState("");
  const [validIdFile, setValidIdFile] = useState(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote("Your browser doesn't support location detection. Please try a different browser.");
      return;
    }
    setLocating(true);
    setLocationNote("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocating(false);
        const outOfBounds =
          latitude < AGOO_BOUNDS.minLat || latitude > AGOO_BOUNDS.maxLat ||
          longitude < AGOO_BOUNDS.minLng || longitude > AGOO_BOUNDS.maxLng;
        setLocationNote(
          outOfBounds
            ? "This pin looks like it's outside Agoo, La Union. You can still continue, but it may take longer to verify your shop."
            : ""
        );
      },
      () => {
        setLocating(false);
        setLocationNote("We couldn't get your location. Please allow location access and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (role === "seller") {
      if (!barangay || !address || !contactNumber) {
        setError("Please fill in your barangay, complete address, and contact number.");
        return;
      }
      if (!location) {
        setError("Please share your shop's location so buyers know you're in Agoo.");
        return;
      }
      if (!proofOfAddressFile) {
        setError("Please upload proof of address (barangay certificate, utility bill, or valid ID).");
        return;
      }
      if (!validIdFile) {
        setError("Please upload a valid government ID.");
        return;
      }
      if (!consent) {
        setError("Please confirm the consent checkbox to continue.");
        return;
      }
    }

    setSubmitting(true);
    try {
      let payload;
      if (role === "seller") {
        payload = new FormData();
        payload.append("name", name);
        payload.append("email", email);
        payload.append("password", password);
        payload.append("role", role);
        payload.append("barangay", barangay);
        payload.append("address", address);
        payload.append("contactNumber", contactNumber);
        payload.append("latitude", location.lat);
        payload.append("longitude", location.lng);
        payload.append("validId", validIdFile);
        payload.append("proofOfAddress", proofOfAddressFile);
      } else {
        payload = { name, email, password, role };
      }

      const newUser = await signup(payload);

      if (newUser.role === "seller") {
        navigate("/", { state: { pendingVerification: true } });
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!role) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <h2>Join AgooBiz Connect</h2>
          <p className="auth-subtitle">How would you like to register?</p>

          <div className="role-picker">
            <button type="button" className="role-btn" onClick={() => setRole("buyer")}>
              Register as Customer
            </button>
            <button type="button" className="role-btn" onClick={() => setRole("seller")}>
              Register as Seller
            </button>
          </div>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <div className={`auth-card ${role === "seller" ? "auth-card-wide" : ""}`}>
        <button type="button" className="back-link" onClick={() => setRole(null)}>
          ← Change role
        </button>

        <h2>{role === "seller" ? "Seller Registration" : "Customer Registration"}</h2>
        <p className="auth-subtitle">
          {role === "seller"
            ? "Set up your home-based kitchen storefront"
            : "Create your account to start ordering"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={role === "seller" ? "Business Name" : "Full Name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          {role === "seller" && (
            <>
              <div className="form-section-divider">Shop Details</div>

              <input
                type="text"
                placeholder="Barangay"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
              />
              <input
                type="text"
                placeholder="Complete Address (street / sitio, house no.)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <input
                type="tel"
                placeholder="Contact Number (e.g. 09XX XXX XXXX)"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                autoComplete="tel"
              />

              <div className="location-block">
                <label>Shop Location <span className="required-star">*</span></label>
                <p className="field-hint">
                  We use this to confirm your shop is in Agoo, La Union, and to help nearby buyers find you.
                </p>
                <button
                  type="button"
                  className="location-btn"
                  onClick={handleUseLocation}
                  disabled={locating}
                >
                  {locating ? "Getting your location..." : location ? "📍 Update my location" : "📍 Use my current location"}
                </button>

                {locationNote && <p className="location-warning">{locationNote}</p>}

                {location && (
                  <div className="location-preview">
                    <iframe
                      title="Your shop location"
                      width="100%"
                      height="200"
                      style={{ border: 0, borderRadius: 12 }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${location.lat + 0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
                    />
                    <p className="location-coords">
                      📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                  </div>
                )}
              </div>

              <div className="form-section-divider">Verification Documents</div>

              <div className="upload-field">
                <label>Proof of Address <span className="required-star">*</span></label>
                <p className="field-hint">
                  Barangay certificate, utility bill, or valid ID showing your Agoo address.
                </p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setProofOfAddressFile(e.target.files[0])}
                />
                {proofOfAddressFile && <span className="file-selected">✓ {proofOfAddressFile.name}</span>}
              </div>

              <div className="upload-field">
                <label>Valid Government ID <span className="required-star">*</span></label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setValidIdFile(e.target.files[0])}
                />
                {validIdFile && <span className="file-selected">✓ {validIdFile.name}</span>}
              </div>

              <label className="consent-checkbox">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I confirm this information is accurate and I consent to AgooBiz Connect processing my data and documents for seller verification purposes.
              </label>

              <p className="pending-note">
                Your shop will be reviewed before it appears in Discover. This usually takes 1–2 business days.
              </p>
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting
              ? "Registering..."
              : `Register as ${role === "seller" ? "Seller" : "Customer"}`}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </section>
  );
}