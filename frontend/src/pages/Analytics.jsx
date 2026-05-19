import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faBook, 
    faGraduationCap, 
    faClock, 
    faBookOpen, 
    faTrophy, 
    faPlayCircle, 
    faCheckCircle, 
    faSpinner, 
    faCalendarAlt,
    faChartBar,
    faBookmark
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Platform-wide metrics (Mentors/Admins)
    const [platformData, setPlatformData] = useState(null);

    // Personal metrics (Students)
    const [studentCourses, setStudentCourses] = useState([]);

    useEffect(() => {
        if (user.role === 'student') {
            fetchStudentAnalytics();
        } else {
            fetchPlatformAnalytics();
        }
    }, [user]);

    const fetchPlatformAnalytics = async () => {
        try {
            setLoading(true);
            const res = await api.get('/analytics');
            setPlatformData(res.data);
        } catch (err) {
            console.error('Failed to load platform analytics', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentAnalytics = async () => {
        try {
            setLoading(true);
            const modulesRes = await api.get('/modules');
            const studentModules = modulesRes.data;

            const coursesWithProgress = await Promise.all(studentModules.map(async (mod) => {
                try {
                    const progressRes = await api.get(`/progress/${mod.id}`);
                    const progData = progressRes.data;
                    
                    const lessonsRes = await api.get(`/modules/${mod.id}/lessons`);
                    const lessons = lessonsRes.data;
                    const nextLesson = lessons.find(l => !progData.completed_lessons?.includes(l.id)) || lessons[0];

                    return {
                        ...mod,
                        progress: progData.percentage || 0,
                        completedCount: progData.completed || 0,
                        totalCount: progData.total || 0,
                        nextLesson: nextLesson ? nextLesson.title : 'All units complete',
                    };
                } catch (e) {
                    return {
                        ...mod,
                        progress: 0,
                        completedCount: 0,
                        totalCount: 0,
                        nextLesson: 'None',
                    };
                }
            }));

            setStudentCourses(coursesWithProgress);
        } catch (err) {
            console.error('Failed to load student learning metrics', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return (
        <Layout>
            <div className="flex justify-center items-center h-64">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-slate-400" />
            </div>
        </Layout>
    );

    // ==========================================
    // RENDER: STUDENT (PERSONAL PERFORMANCE)
    // ==========================================
    if (user.role === 'student') {
        const totalAssigned = studentCourses.length;
        const totalCompletedModules = studentCourses.filter(c => c.progress === 100).length;
        
        let overallLessonsCompleted = 0;
        let overallLessonsTotal = 0;
        studentCourses.forEach(c => {
            overallLessonsCompleted += c.completedCount;
            overallLessonsTotal += c.totalCount;
        });

        const overallProgressPercentage = overallLessonsTotal > 0 
            ? Math.round((overallLessonsCompleted / overallLessonsTotal) * 100) 
            : 0;

        return (
            <Layout>
                <div className="border-b border-slate-200 pb-5 mb-6 animate-fade-in">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">My Progress Dashboard</span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Personal Learning Analytics</h1>
                </div>

                {/* Primary Student Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
                    {[
                        { title: 'Enrolled Modules', value: totalAssigned, icon: faBookOpen, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                        { title: 'Mastered Courses', value: totalCompletedModules, icon: faTrophy, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                        { title: 'Lessons Completed', value: `${overallLessonsCompleted} / ${overallLessonsTotal}`, icon: faCheckCircle, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                        { title: 'Curriculum Progress', value: `${overallProgressPercentage}%`, icon: faChartBar, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
                    ].map((stat, i) => (
                        <div key={i} className="card-enterprise p-5 flex items-center justify-between">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</h4>
                                <p className="text-xl font-bold text-slate-800 tracking-tight mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded border flex items-center justify-center ${stat.color}`}>
                                <FontAwesomeIcon icon={stat.icon} className="text-sm" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detailed Student Progress Table */}
                <div className="card-enterprise overflow-hidden animate-fade-in">
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-200">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Curriculum Progression Matrix</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="pb-3 pt-4 px-5">Module Detail</th>
                                    <th className="pb-3 pt-4 px-5">Instructed By</th>
                                    <th className="pb-3 pt-4 px-5">Active Goal</th>
                                    <th className="pb-3 pt-4 px-5">Completion State</th>
                                    <th className="pb-3 pt-4 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {studentCourses.map(course => (
                                    <tr key={course.id} className="text-xs text-slate-700 hover:bg-slate-50/30 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="font-bold text-slate-800 leading-none">{course.title}</div>
                                            <div className="text-[10px] text-slate-400 mt-1 max-w-[280px] truncate">{course.description}</div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="font-semibold text-slate-655">{course.mentor_name || 'All Mentors'}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="text-slate-500 font-medium max-w-[180px] truncate block">{course.nextLesson}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="w-[150px]">
                                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider mb-1">
                                                    <span className={course.progress === 100 ? 'text-emerald-600' : 'text-primary'}>{course.progress}%</span>
                                                    <span className="text-slate-400">{course.completedCount}/{course.totalCount} Units</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-300 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                                                        style={{ width: `${course.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <button 
                                                onClick={() => navigate(`/module/${course.id}`)}
                                                className="text-primary font-bold text-xs hover:underline cursor-pointer"
                                            >
                                                Launch
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {studentCourses.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-slate-400 text-xs font-semibold">
                                            No active learning module assignments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Layout>
        );
    }

    // ==========================================
    // RENDER: MENTOR / ADMIN (PLATFORM OPERATIONS)
    // ==========================================
    const { summary, enrollments, recentSignups, recentCompletions, courseMetrics } = platformData || {};

    return (
        <Layout>
            <div className="border-b border-slate-200 pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Quantified Platform Analytics</span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Executive Analytics</h1>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-400" />
                    <span>Real-time DB Connection Active</span>
                </div>
            </div>

            {/* Platform Metrics Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fade-in">
                {[
                    { title: 'Registered Students', value: summary?.students || 0, icon: faUsers, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { title: 'Principal Mentors', value: summary?.mentors || 0, icon: faGraduationCap, color: 'text-purple-600 bg-purple-50 border-purple-100' },
                    { title: 'Deployed Modules', value: summary?.modules || 0, icon: faBook, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { title: 'Syllabus Instruction Units', value: summary?.lessons || 0, icon: faBookOpen, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                    { title: 'Completed Lessons', value: summary?.completions || 0, icon: faCheckCircle, color: 'text-amber-600 bg-amber-50 border-amber-100' }
                ].map((stat, i) => (
                    <div key={i} className="card-enterprise p-5 flex items-center justify-between">
                        <div>
                            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.title}</h4>
                            <p className="text-xl font-bold text-slate-800 tracking-tight mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-9 h-9 rounded border flex items-center justify-center ${stat.color}`}>
                            <FontAwesomeIcon icon={stat.icon} className="text-xs" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Grid: Enrollment Metrics & Course Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 animate-fade-in">
                {/* Real course metrics & completions */}
                <div className="xl:col-span-2 card-enterprise overflow-hidden">
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Curriculum Analytics Matrix</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="pb-3 pt-4 px-5">Module</th>
                                    <th className="pb-3 pt-4 px-5">Enrolled Size</th>
                                    <th className="pb-3 pt-4 px-5">Total Lessons</th>
                                    <th className="pb-3 pt-4 px-5">Completed Units</th>
                                    <th className="pb-3 pt-4 px-5 text-right">Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {courseMetrics?.map(metric => {
                                    const totalUnitsExpected = metric.enrolled_students * metric.total_lessons;
                                    const rawCompletionPercentage = totalUnitsExpected > 0 
                                        ? Math.round((metric.completed_lessons / totalUnitsExpected) * 100) 
                                        : 0;
                                    
                                    return (
                                        <tr key={metric.id} className="text-xs text-slate-700 hover:bg-slate-50/30 transition-colors">
                                            <td className="py-3.5 px-5 font-semibold text-slate-850">{metric.title}</td>
                                            <td className="py-3.5 px-5 font-bold text-slate-600">{metric.enrolled_students} Students</td>
                                            <td className="py-3.5 px-5 text-slate-500 font-medium">{metric.total_lessons} Units</td>
                                            <td className="py-3.5 px-5 text-slate-500 font-medium">{metric.completed_lessons} Units</td>
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <span className={`font-bold ${rawCompletionPercentage === 100 ? 'text-emerald-600' : 'text-slate-750'}`}>{rawCompletionPercentage}%</span>
                                                    <div className="w-[60px] bg-slate-100 h-1 rounded-full overflow-hidden">
                                                        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${rawCompletionPercentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {courseMetrics?.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-400 text-xs font-semibold">
                                            No curriculum learning modules initialized.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Enrolled Breakdown Rank */}
                <div className="card-enterprise p-5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-3.5 border-b border-slate-100 mb-4">Enrollment Volumes</h3>
                        <div className="space-y-4">
                            {enrollments?.slice(0, 5).map((module, i) => (
                                <div key={module.id} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-slate-700">
                                        <span className="truncate max-w-[200px] font-bold">{module.title}</span>
                                        <span className="font-bold text-primary">{module.enrolled_students} Enrolled</span>
                                    </div>
                                    <div className="w-full bg-slate-50 h-1.5 rounded overflow-hidden border border-slate-200">
                                        <div 
                                            className="bg-primary h-full transition-all duration-300" 
                                            style={{ width: `${(module.enrolled_students / Math.max(...enrollments.map(m => m.enrolled_students || 1))) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {enrollments?.length === 0 && (
                                <div className="text-center text-slate-400 text-xs py-8">
                                    No enrollment statistics available.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3.5 mt-4">
                        * Distribution normalized relative to the most highly enrolled course.
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Live Activity logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                {/* Recent Student Registrations */}
                <div className="card-enterprise overflow-hidden">
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-200">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faUsers} className="text-slate-400 text-[10px]" />
                            <span>Recent Student Registrations</span>
                        </h3>
                    </div>
                    <div className="p-4">
                        <div className="divide-y divide-slate-100">
                            {recentSignups?.map(student => (
                                <div key={student.id} className="py-3 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-bold text-slate-800">{student.username}</span>
                                        <span className="text-[10px] text-slate-400 ml-2 font-mono">{student.email}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-455 font-medium flex items-center gap-1">
                                        <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[9px]" />
                                        {formatDate(student.created_at)}
                                    </div>
                                </div>
                            ))}
                            {recentSignups?.length === 0 && (
                                <div className="text-center text-slate-400 text-xs py-8">
                                    No student signups recorded.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Completions */}
                <div className="card-enterprise overflow-hidden">
                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-200">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-slate-400 text-[10px]" />
                            <span>Recent Curriculum Milestones</span>
                        </h3>
                    </div>
                    <div className="p-4">
                        <div className="divide-y divide-slate-100">
                            {recentCompletions?.map((comp, i) => (
                                <div key={i} className="py-3 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-bold text-slate-800">{comp.username}</span>
                                        <span className="text-slate-450 ml-1.5">completed</span>
                                        <span className="font-bold text-primary ml-1.5" title={comp.module_title}>{comp.lesson_title}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-455 font-medium flex items-center gap-1">
                                        <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[9px]" />
                                        {formatDate(comp.completed_at)}
                                    </div>
                                </div>
                            ))}
                            {recentCompletions?.length === 0 && (
                                <div className="text-center text-slate-400 text-xs py-8">
                                    No student curriculum milestones logged.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
