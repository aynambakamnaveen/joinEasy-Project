
import { useAppContext } from "../Context/UserContext";
import TeacherDashboard from "../Components/TeacherDashboard";
import StudentDashboard from "../Components/StudentDashboard"
const Home = () => {
  const {
    user,
  } = useAppContext();

  if (user?.role === "teacher") {
    return <TeacherDashboard/>
  } else {
    return <StudentDashboard/>
  }
};

export default Home;
