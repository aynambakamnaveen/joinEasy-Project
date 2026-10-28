import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios.ts";

type User = {
  id: string;
  email: string;
  username: string;
  profileImage?: string | null;
  role: string;
};

type AppContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;

  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;

  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  assignments: any[];
  setAssignments: React.Dispatch<React.SetStateAction<any[]>>;

  teacherAssignments: any[];
  setTeacherAssignments: React.Dispatch<
    React.SetStateAction<any[]>
  >;

  teacherGroups: any[];
  setTeacherGropus: React.Dispatch<
    React.SetStateAction<any[]>
  >;

  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [loggedIn, setLoggedIn] = useState(false);

  const [loading, setLoading] = useState(true);

  const [assignments, setAssignments] = useState<any[]>([]);

  const [teacherAssignments, setTeacherAssignments] = useState<any[]>(
    []
  );

  const [teacherGroups, setTeacherGropus] = useState<any[]>(
    []
  );

  // --------------------------------
  // Get Teacher Assignments
  // --------------------------------

  const getTeacherAssignments = async () => {
    try {
      const response = await api.get("/getTeacherAssignments");

      setTeacherAssignments(
        response.data?.assignments || []
      );
    } catch (error) {
      console.error(
        "Teacher assignments not found:",
        error
      );

      setTeacherAssignments([]);
    }
  };

  const getTeacherGroups = async () => {
    try {
      const res = await api.get("/getTeacherGroups");
      setTeacherGropus(res.data?.group)
    } catch (error) {
      console.log(error)
    }
  }
  // --------------------------------
  // Get Student Assignments
  // --------------------------------

  const getUserAssignments = async () => {
    try {
      const response = await api.get("/getUserAssignments");

      setAssignments(
        response.data?.assignments || []
      );
    } catch (error) {
      console.error(
        "Student assignments not found:",
        error
      );

      setAssignments([]);
    }
  };

  // --------------------------------
  // Authenticate User
  // --------------------------------

  const authenticate = async () => {
    try {
      setLoading(true);

      const response = await api.get("/user/auth", {
        withCredentials: true,
      });

      const userData = response.data?.user;

      console.log("AUTH RESPONSE:", response.data);

      if (!userData) {
        setUser(null);
        setLoggedIn(false);
        return;
      }

      const authenticatedUser: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        profileImage: userData.ProfileImage,
        role: userData.role,
      };

      setUser(authenticatedUser);
      setLoggedIn(true);

    } catch (error) {
      console.error("Authentication failed:", error);

      setUser(null);
      setLoggedIn(false);

      setAssignments([]);
      setTeacherAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Logout
  // --------------------------------

  const logout = async () => {
    try {
      await api.post(
        "/user/logout",
        {},
        {
          withCredentials: true,
        }
      );

      setUser(null);
      setLoggedIn(false);

      setAssignments([]);
      setTeacherAssignments([]);

      toast.success("Logged out successfully");

    } catch (error) {
      console.error("Logout failed:", error);

      toast.error(
        "Logout failed. Please try again."
      );
    }
  };

  // --------------------------------
  // Authenticate when AppProvider mounts
  // --------------------------------

  useEffect(() => {
    authenticate();
  }, []);

  // --------------------------------
  // Fetch Student Assignments
  // --------------------------------

  useEffect(() => {
    if (
      !loading &&
      loggedIn &&
      user?.role === "student"
    ) {
      getUserAssignments();
      getTeacherGroups();
    }
  }, [loading, loggedIn, user?.role]);

  // --------------------------------
  // Fetch Teacher Assignments
  // --------------------------------

  useEffect(() => {
    if (
      !loading &&
      loggedIn &&
      user?.role === "teacher"
    ) {
      getTeacherAssignments();
      getTeacherGroups();
    }
  }, [loading, loggedIn, user?.role]);

  // --------------------------------
  // Context Provider
  // --------------------------------

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,

        loggedIn,
        setLoggedIn,

        loading,
        setLoading,

        assignments,
        setAssignments,

        teacherAssignments,
        setTeacherAssignments,

        teacherGroups,
        setTeacherGropus,

        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}



export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useAppContext must be used within an AppProvider"
    );
  }

  return context;
}
