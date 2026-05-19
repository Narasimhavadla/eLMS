import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faChartLine, faSpinner, faUserGraduate } from '@fortawesome/free-solid-svg-icons';

const MentorStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentsProgress = async () => {
            try {
                setLoading(true);
                const modulesRes = await api.get('/modules');
                const mentorModules = modulesRes.data;

                const allStudentsList = [];
                
                await Promise.all(mentorModules.map(async (mod) => {
                    try {
                        const progressRes = await api.get(`/progress/${mod.id}/all`);
                        const moduleStudents = progressRes.data;
                        
                        moduleStudents.forEach((student, index) => {
                            allStudentsList.push({
                                id: `${mod.id}-${index}-${student.email}`,
                                name: student.username,
                                email: student.email,
                                activeCourse: mod.title,
                                progress: `${student.percentage}%`,
                                rawProgress: student.percentage,
                                completed: student.completed_count,
                                total: student.total_lessons
                            });
                        });
                    } catch (e) {
                        console.error(`Failed to fetch student progress for module ${mod.id}`, e);
                    }
                }));

                // Deduplicate or group by student email if needed, but since a student can be in multiple courses
                // showing them per course is very standard.
                setStudents(allStudentsList);
            } catch (err) {
                console.error('Failed to fetch mentor students', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsProgress();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mb-8 animate-slide-in">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">My Students</h1>
                <p className="text-gray-500 mt-1">Track progress and support your active learners.</p>
            </div>

            {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
                    {students.map(student => (
                        <div key={student.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                        {student.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{student.name}</h3>
                                        <p className="text-xs text-gray-500">{student.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="font-bold text-gray-700 truncate max-w-[200px]">{student.activeCourse}</span>
                                    <span className="font-black text-primary">{student.progress}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-500" 
                                        style={{ width: student.progress }}
                                    ></div>
                                </div>

                                <div className="flex justify-between text-xs text-gray-400 font-bold mb-4">
                                    <span>Lessons Completed</span>
                                    <span>{student.completed} / {student.total}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                        <FontAwesomeIcon icon={faEnvelope} /> Message
                                    </button>
                                    <button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                        <FontAwesomeIcon icon={faChartLine} /> Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-100 flex flex-col items-center animate-slide-in shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-6">
                        <FontAwesomeIcon icon={faUserGraduate} className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600">No Assigned Students</h3>
                    <p className="text-gray-400 mt-2 max-w-sm">Use the Curriculum tab to assign students to your learning modules!</p>
                </div>
            )}
        </Layout>
    );
};

export default MentorStudents;
