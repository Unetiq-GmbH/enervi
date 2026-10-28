import { Auth0Provider } from "@auth0/auth0-react";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const domain = import.meta.env.VITE_REACT_APP_AUTH0_ISSUER_BASE_URL || "";
  const clientId = import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID || "";
  const audience = import.meta.env.VITE_REACT_APP_AUTH0_AUDIENCE || "";

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
      }}
    >
      {children}
    </Auth0Provider>
  );
}

export default AuthProvider;
