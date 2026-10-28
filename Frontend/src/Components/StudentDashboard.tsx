import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppContext } from "../Context/UserContext";


const StudentDashboard = () => {
  const {
        user,
        loggedIn,
        loading,
        teacherAssignments,
        teacherGroups,
    } = useAppContext();

    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!loading && !loggedIn) {
        toast.error("Please login to continue");
        navigate("/login");
        }
    }, [loading, loggedIn, navigate]);
  return (
    <div>StudentDashboard</div>
  )
}

export default StudentDashboard