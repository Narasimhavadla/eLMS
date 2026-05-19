import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import MentorDashboard from './MentorDashboard';
import AdminDashboard from './AdminDashboard';
import Layout from '../components/Layout';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <Layout>
            {user.role === 'student' && <StudentDashboard />}
            {user.role === 'mentor' && <MentorDashboard />}
            {user.role === 'admin' && <AdminDashboard />}
        </Layout>
    );
};

export default Dashboard;
