
import { useAppContext } from "../Context/UserContext";
import TeacherAssignments from "../Components/TeacherAssignments";
import StudentAssignments from "../Components/StudentAssignments"
const Home = () => {
    const {
        user,
    } = useAppContext();

    if (user?.role === "teacher") {
        return <TeacherAssignments/>
    } else {
        return <StudentAssignments/>
    }
};

export default Home;