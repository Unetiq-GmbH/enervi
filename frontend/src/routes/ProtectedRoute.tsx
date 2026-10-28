import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { withAuthenticationRequired } from "@auth0/auth0-react";

import UserContext from "@/contexts/UserContext";

interface ProtectedRouteProps {
  component: React.FC;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component,
  allowedRoles,
  ...props
}) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <div className="spinner"></div>
      </div>
    ),
  });

  if (!user) {
    return <Component {...props} />;
  }

  if (!allowedRoles.includes(user.role.name)) {
    navigate("/");
    return null;
  }

  return <Component {...props} />;
};

export default ProtectedRoute;
