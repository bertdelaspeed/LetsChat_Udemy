import { createContext, useState } from "react";

export const AuthenticatedUserContext = createContext({});
const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState(null);
  return (
    <AuthenticatedUserContext.Provider
      value={{ user, setUser, userAvatarUrl, setUserAvatarUrl }}
    >
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

export default AuthenticatedUserProvider;
