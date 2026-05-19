import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faTrophy, faClock, faSpinner, faBookOpen } from '@fortawesome/free-solid-svg-icons';

const StudentLearning = () => {
    const navigate = useNavigate();
    const [inProgress, setInProgress] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLearningData = async () => {
            try {
                setLoading(true);
                const modulesRes = await api.get('/modules');
                const studentModules = modulesRes.data;

                const coursesWithProgress = await Promise.all(studentModules.map(async (mod) => {
                    try {
                        const progressRes = await api.get(`/progress/${mod.id}`);
                        const progData = progressRes.data; // { percentage, completed, total, completed_lessons }
                        
                        // Fetch lessons to find the next incomplete lesson
                        const lessonsRes = await api.get(`/modules/${mod.id}/lessons`);
                        const lessons = lessonsRes.data;
                        const nextLesson = lessons.find(l => !progData.completed_lessons?.includes(l.id)) || lessons[0];

                        return {
                            ...mod,
                            progress: `${progData.percentage}%`,
                            rawProgress: progData.percentage,
                            completedCount: progData.completed,
                            totalCount: progData.total,
                            nextLesson: nextLesson ? nextLesson.title : 'None',
                            timeLeft: 'Self-paced'
                        };
                    } catch (e) {
                        return {
                            ...mod,
                            progress: '0%',
                            rawProgress: 0,
                            completedCount: 0,
                            totalCount: 0,
                            nextLesson: 'None',
                            timeLeft: 'Self-paced'
                        };
                    }
                }));

                setInProgress(coursesWithProgress.filter(c => c.rawProgress < 100));
                setCompleted(coursesWithProgress.filter(c => c.rawProgress === 100));
            } catch (err) {
                console.error('Failed to fetch student curriculum', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLearningData();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-slate-400" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="border-b border-slate-200 pb-5 mb-6 animate-fade-in">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Quantified Learning</span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">My Enrolled Curriculum</h1>
            </div>

            <div className="space-y-4 mb-8 animate-fade-in">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {inProgress.map(course => (
                        <div key={course.id} className="card-enterprise p-6 flex flex-col justify-between min-h-[200px]">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm mb-2">{course.title}</h3>
                                <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                                    <FontAwesomeIcon icon={faPlayCircle} className="text-primary text-[10px]" />
                                    <span>Up next: <span className="font-semibold text-slate-700 truncate max-w-[200px] inline-block align-bottom">{course.nextLesson}</span></span>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                    <span className="text-primary">{course.progress} Completed</span>
                                    <span className="text-slate-400 flex items-center gap-1"><FontAwesomeIcon icon={faClock} /> {course.timeLeft}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-300" 
                                        style={{ width: course.progress }}
                                    ></div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/module/${course.id}`)}
                                    className="mt-5 w-full bg-primary hover:bg-primary-hover text-white py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Continue Curriculum
                                </button>
                            </div>
                        </div>
                    ))}
                    {inProgress.length === 0 && (
                        <div className="col-span-2 card-enterprise p-12 text-center flex flex-col items-center justify-center">
                            <div className="w-10 h-10 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                                <FontAwesomeIcon icon={faBookOpen} />
                            </div>
                            <p className="text-slate-750 text-xs font-bold">No active curriculum modules in progress.</p>
                            <p className="text-[10px] text-slate-400 mt-1">Once assigned to a course, you will be able to review and track them here.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 animate-fade-in">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mastered Modules</h2>
                <div className="card-enterprise overflow-hidden">
                    {completed.length > 0 ? (
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-100">
                                {completed.map(course => (
                                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors text-xs text-slate-700">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <FontAwesomeIcon icon={faTrophy} className="text-xs" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{course.title}</p>
                                                    <p className="text-[10px] text-slate-450 mt-0.5">Instruction module successfully completed.</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-bold text-emerald-600 text-sm">100%</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => navigate(`/module/${course.id}`)}
                                                className="text-primary font-bold text-xs hover:underline cursor-pointer"
                                            >
                                                Review Curriculum
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                            No mastered modules recorded. Complete assignments to unlock.
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default StudentLearning;
