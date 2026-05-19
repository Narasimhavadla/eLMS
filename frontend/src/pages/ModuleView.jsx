import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronLeft, 
    faCheckCircle, 
    faPlus, 
    faSpinner, 
    faPlayCircle, 
    faBook, 
    faFileAlt, 
    faTrash, 
    faChevronRight, 
    faEdit, 
    faSave, 
    faQuestionCircle, 
    faCheck, 
    faTimes,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return null;
};

const ModuleView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [module, setModule] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [progress, setProgress] = useState({ percentage: 0, completed_lessons: [] });
    const [loading, setLoading] = useState(true);
    
    // Lesson Editor / Creation States
    const [showEditModal, setShowEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // true if editing existing, false if creating new
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [lessonForm, setLessonForm] = useState({ title: '', content: '', video_url: '' });
    const [quizQuestions, setQuizQuestions] = useState([]);

    // Interactive Quiz Taking States
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizGraded, setQuizGraded] = useState(false);
    const [quizPassed, setQuizPassed] = useState(false);

    // Video Watching State
    const [videoWatched, setVideoWatched] = useState(false);

    useEffect(() => {
        fetchModuleData();
    }, [id]);

    const fetchModuleData = async () => {
        try {
            const [modRes, lessonRes, progRes] = await Promise.all([
                api.get(`/modules/${id}`),
                api.get(`/modules/${id}/lessons`),
                user.role === 'student' ? api.get(`/progress/${id}`) : Promise.resolve({ data: { percentage: 0, completed_lessons: [] } })
            ]);
            
            setModule(modRes.data);
            setLessons(lessonRes.data);
            setProgress(progRes.data);
            
            // Set current lesson if not set, or restore current selected lesson
            if (lessonRes.data.length > 0) {
                if (currentLesson) {
                    const updated = lessonRes.data.find(l => l.id === currentLesson.id);
                    setCurrentLesson(updated || lessonRes.data[0]);
                } else {
                    setCurrentLesson(lessonRes.data[0]);
                }
            } else {
                setCurrentLesson(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Reset quiz and video states whenever current lesson changes
    useEffect(() => {
        setSelectedAnswers({});
        setQuizGraded(false);
        setQuizPassed(false);
        
        if (!currentLesson) return;

        // Determine if video is already considered watched
        const alreadyCompleted = !currentLesson.video_url || 
                                 user.role !== 'student' || 
                                 (progress.completed_lessons && progress.completed_lessons.includes(currentLesson.id));
        
        setVideoWatched(alreadyCompleted);

        // If there is no video url, we don't need any player setup
        if (!currentLesson.video_url) return;

        const isYt = currentLesson.video_url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        const isVimeo = currentLesson.video_url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/);
        
        if (isYt) {
            const ytId = isYt[1];
            
            // Inject YouTube Iframe API if not loaded
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            let player;
            const initPlayer = () => {
                player = new window.YT.Player('yt-player', {
                    height: '100%',
                    width: '100%',
                    videoId: ytId,
                    events: {
                        'onStateChange': (event) => {
                            // YT.PlayerState.ENDED is 0
                            if (event.data === 0) {
                                setVideoWatched(true);
                            }
                        }
                    }
                });
            };

            // Call or register callback
            if (window.YT && window.YT.Player) {
                initPlayer();
            } else {
                window.onYouTubeIframeAPIReady = initPlayer;
            }

            return () => {
                if (player && player.destroy) player.destroy();
            };
        } else if (isVimeo) {
            // Inject Vimeo Player API if not loaded
            if (!window.Vimeo) {
                const tag = document.createElement('script');
                tag.src = "https://player.vimeo.com/api/player.js";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            let player;
            const checkVimeo = setInterval(() => {
                const iframe = document.getElementById('vimeo-player');
                if (iframe && window.Vimeo) {
                    clearInterval(checkVimeo);
                    player = new window.Vimeo.Player(iframe);
                    player.on('ended', () => {
                        setVideoWatched(true);
                    });
                }
            }, 200);

            return () => {
                clearInterval(checkVimeo);
                if (player && player.unload) player.unload();
            };
        }
    }, [currentLesson, progress.completed_lessons]);

    const handleMarkComplete = async (lessonId) => {
        // Enforce full video watch logic for students
        if (user.role === 'student' && currentLesson.video_url && !videoWatched) {
            alert("Please watch the video instruction unit to completion before proceeding.");
            return;
        }

        // If there's a quiz and they haven't passed it yet, block completion
        if (currentLesson.quiz_questions) {
            try {
                const questions = JSON.parse(currentLesson.quiz_questions);
                if (questions && questions.length > 0 && !quizPassed) {
                    alert("Please correctly answer all quiz questions to complete this lesson.");
                    return;
                }
            } catch (e) {
                // Ignore parse errors and let them complete
            }
        }

        try {
            await api.post('/progress/complete', { lesson_id: lessonId });
            fetchModuleData();
            const currentIndex = lessons.findIndex(l => l.id === lessonId);
            if (currentIndex < lessons.length - 1) {
                setCurrentLesson(lessons[currentIndex + 1]);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            alert('Failed to update progress');
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Are you sure you want to delete this lesson unit?')) return;
        try {
            await api.delete(`/modules/lessons/${lessonId}`);
            if (currentLesson?.id === lessonId) setCurrentLesson(null);
            fetchModuleData();
        } catch (err) {
            alert('Deletion failed');
        }
    };

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setEditingLessonId(null);
        setLessonForm({ title: '', content: '', video_url: '' });
        setQuizQuestions([]);
        setShowEditModal(true);
    };

    const handleOpenEditModal = (lesson) => {
        setIsEditing(true);
        setEditingLessonId(lesson.id);
        setLessonForm({
            title: lesson.title,
            content: lesson.content,
            video_url: lesson.video_url || ''
        });
        
        // Parse quiz questions if existing
        if (lesson.quiz_questions) {
            try {
                setQuizQuestions(JSON.parse(lesson.quiz_questions));
            } catch (e) {
                setQuizQuestions([]);
            }
        } else {
            setQuizQuestions([]);
        }
        setShowEditModal(true);
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        const payload = {
            ...lessonForm,
            quiz_questions: quizQuestions.length > 0 ? JSON.stringify(quizQuestions) : null
        };

        try {
            if (isEditing) {
                await api.put(`/modules/lessons/${editingLessonId}`, payload);
            } else {
                await api.post(`/modules/${id}/lessons`, payload);
            }
            setShowEditModal(false);
            fetchModuleData();
        } catch (err) {
            alert('Failed to save lesson');
        }
    };

    // Quiz Editor Helper functions
    const handleAddQuestion = () => {
        setQuizQuestions([
            ...quizQuestions,
            { question: '', options: ['', '', '', ''], answer: 0 }
        ]);
    };

    const handleRemoveQuestion = (index) => {
        setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    };

    const handleUpdateQuestionText = (index, value) => {
        const updated = [...quizQuestions];
        updated[index].question = value;
        setQuizQuestions(updated);
    };

    const handleUpdateOption = (qIdx, oIdx, value) => {
        const updated = [...quizQuestions];
        updated[qIdx].options[oIdx] = value;
        setQuizQuestions(updated);
    };

    const handleUpdateAnswer = (qIdx, value) => {
        const updated = [...quizQuestions];
        updated[qIdx].answer = parseInt(value, 10);
        setQuizQuestions(updated);
    };

    // Interactive Quiz Taking Functions
    const handleSelectOption = (qIdx, oIdx) => {
        if (quizGraded && quizPassed) return; // Locked once passed
        setSelectedAnswers({
            ...selectedAnswers,
            [qIdx]: oIdx
        });
    };

    const handleGradeQuiz = (questions) => {
        let allCorrect = true;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] !== q.answer) {
                allCorrect = false;
            }
        });
        setQuizGraded(true);
        setQuizPassed(allCorrect);
    };

    const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
    const nextLesson = lessons[currentIndex + 1];
    const prevLesson = lessons[currentIndex - 1];

    const isYtVideo = currentLesson?.video_url && currentLesson.video_url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const isVimeoVideo = currentLesson?.video_url && currentLesson.video_url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/);

    if (loading) return (
        <div className="flex justify-center items-center h-screen -mt-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-slate-400" />
        </div>
    );

    return (
        <Layout>
            <div className="space-y-6">
                {/* Back button strip */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-xs uppercase tracking-wider bg-white border border-slate-200 px-4 py-2 rounded shadow-sm cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                        <span>Curriculum Grid</span>
                    </button>
                    {module && (
                        <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Current Course</span>
                            <h2 className="text-sm font-bold text-slate-800 leading-none mt-1">{module.title}</h2>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Primary Course Content Viewer */}
                    <div className="xl:col-span-3 space-y-6">
                        {currentLesson ? (
                            <div className="card-enterprise bg-white overflow-hidden min-h-[700px] flex flex-col justify-between">
                                <div className="p-8 md:p-10 space-y-8">
                                    {/* Lesson Meta Header */}
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 bg-blue-50 text-primary border border-blue-100 rounded flex items-center justify-center">
                                                <FontAwesomeIcon icon={faFileAlt} className="text-sm" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none mb-1">UNIT {currentIndex + 1} OF {lessons.length}</p>
                                                <h1 className="text-xl font-bold text-slate-900 leading-tight">{currentLesson.title}</h1>
                                            </div>
                                        </div>

                                        {(user.role === 'mentor' || user.role === 'admin') && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEditModal(currentLesson)}
                                                    className="w-7 h-7 bg-white border border-slate-200 hover:border-slate-350 text-slate-655 rounded flex items-center justify-center transition-colors cursor-pointer"
                                                    title="Edit Lesson & Quiz"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="text-[10px]" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLesson(currentLesson.id)}
                                                    className="w-7 h-7 bg-white border border-slate-200 hover:border-rose-350 text-slate-450 hover:text-rose-600 rounded flex items-center justify-center transition-colors cursor-pointer"
                                                    title="Delete Unit"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Video Player Section */}
                                    {currentLesson.video_url && (
                                        <div className="space-y-4">
                                            <div className="rounded border border-slate-200 overflow-hidden shadow-sm aspect-video bg-black max-w-3xl mx-auto w-full">
                                                {isYtVideo ? (
                                                    <div id="yt-player" className="w-full h-full"></div>
                                                ) : isVimeoVideo ? (
                                                    <iframe 
                                                        id="vimeo-player"
                                                        src={getEmbedUrl(currentLesson.video_url)}
                                                        className="w-full h-full border-0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title={currentLesson.title}
                                                    ></iframe>
                                                ) : (
                                                    <video 
                                                        src={currentLesson.video_url}
                                                        controls
                                                        onEnded={() => setVideoWatched(true)}
                                                        className="w-full h-full"
                                                    ></video>
                                                )}
                                            </div>

                                            {/* Video Status Notification Block */}
                                            <div className="max-w-3xl mx-auto flex justify-center">
                                                <div className={`inline-flex items-center gap-2 py-1.5 px-3 border rounded text-[9px] font-bold uppercase tracking-wider ${videoWatched ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-amber-50 border-amber-250 text-amber-700'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${videoWatched ? 'bg-emerald-500 shadow-sm' : 'bg-amber-550 animate-pulse'}`}></div>
                                                    <span>{videoWatched ? 'Video Lesson Viewed Completely (You can still replay and watch this video at any time)' : 'Mandatory Video: Watch Complete Video to Unlock Unit'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Markdown Lesson Content */}
                                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-xs border-b border-slate-100 pb-8">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {currentLesson.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Interactive Quiz Taking Box */}
                                    {currentLesson.quiz_questions && (() => {
                                        try {
                                            const questions = JSON.parse(currentLesson.quiz_questions);
                                            if (!questions || questions.length === 0) return null;
                                            return (
                                                <div className="card-enterprise bg-slate-50/50 p-6 space-y-6">
                                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                                                        <FontAwesomeIcon icon={faQuestionCircle} className="text-primary text-sm" />
                                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lesson Comprehension Assessment</h3>
                                                    </div>

                                                    <div className="space-y-6">
                                                        {questions.map((q, qIdx) => (
                                                            <div key={qIdx} className="space-y-2">
                                                                <p className="text-xs font-bold text-slate-800">Q{qIdx + 1}: {q.question}</p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {q.options.map((opt, oIdx) => {
                                                                        const isSelected = selectedAnswers[qIdx] === oIdx;
                                                                        let optClass = "border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50";
                                                                        
                                                                        if (isSelected) {
                                                                            optClass = "border-primary bg-blue-50/50 text-slate-900";
                                                                        }
                                                                        
                                                                        if (quizGraded) {
                                                                            if (oIdx === q.answer) {
                                                                                optClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                                                                            } else if (isSelected && oIdx !== q.answer) {
                                                                                optClass = "border-rose-500 bg-rose-50 text-rose-800";
                                                                            }
                                                                        }

                                                                        return (
                                                                            <button
                                                                                key={oIdx}
                                                                                onClick={() => handleSelectOption(qIdx, oIdx)}
                                                                                disabled={quizGraded && quizPassed}
                                                                                className={`w-full text-left p-3 rounded border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${optClass}`}
                                                                            >
                                                                                <span>{opt}</span>
                                                                                {quizGraded && oIdx === q.answer && (
                                                                                    <FontAwesomeIcon icon={faCheck} className="text-emerald-600 text-xs" />
                                                                                )}
                                                                                {quizGraded && isSelected && oIdx !== q.answer && (
                                                                                    <FontAwesomeIcon icon={faTimes} className="text-rose-600 text-xs" />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        {quizGraded ? (
                                                            quizPassed ? (
                                                                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                                    <span>Assessment Passed Successfully</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                    <span>Some Answers are Incorrect. Please retry.</span>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="text-[10px] font-semibold text-slate-400">
                                                                Answer all questions to finalize progress.
                                                            </div>
                                                        )}

                                                        {(!quizGraded || !quizPassed) && (
                                                            <button
                                                                onClick={() => handleGradeQuiz(questions)}
                                                                className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                                            >
                                                                Submit Answers
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        } catch (e) {
                                            return null;
                                        }
                                    })()}
                                </div>

                                {/* Next / Previous unit bottom bar */}
                                <div className="p-6 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    {prevLesson ? (
                                        <button 
                                            onClick={() => { setCurrentLesson(prevLesson); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold transition-colors text-xs uppercase tracking-wider cursor-pointer group"
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} className="group-hover:-translate-x-0.5 transition-transform" />
                                            <span>Previous Unit</span>
                                        </button>
                                    ) : <div></div>}

                                    {user.role === 'student' && (
                                        <button 
                                            onClick={() => handleMarkComplete(currentLesson.id)}
                                            disabled={currentLesson.video_url && !videoWatched}
                                            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            <span>{nextLesson ? 'Complete & Advance' : 'Finalize Course'}</span>
                                        </button>
                                    )}

                                    {nextLesson && (user.role !== 'student') && (
                                        <button 
                                            onClick={() => { setCurrentLesson(nextLesson); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold transition-colors text-xs uppercase tracking-wider cursor-pointer group"
                                        >
                                            <span>Next Unit</span>
                                            <FontAwesomeIcon icon={faChevronRight} className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card-enterprise p-24 text-center flex flex-col items-center justify-center">
                                <div className="w-14 h-14 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-300 mb-5">
                                    <FontAwesomeIcon icon={faBook} className="text-xl" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-700">No Unit Selected</h3>
                                <p className="text-slate-450 text-xs mt-1.5 max-w-sm leading-relaxed">
                                    This module does not contain any published instruction units. Add units from the syllabus grid panel.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Syllabus Sidebar / Trackers */}
                    <div className="xl:col-span-1 space-y-6">
                        {user.role === 'student' && (
                            <div className="card-enterprise p-5 space-y-4">
                                <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Quantified Progress</h3>
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[9px] font-bold uppercase text-primary tracking-wider px-2 py-0.25 bg-blue-50 border border-blue-100 rounded">Progress Tracker</span>
                                        <span className="text-base font-bold text-slate-800">{progress.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                                        <div 
                                            style={{ width: `${progress.percentage}%` }} 
                                            className="h-full bg-primary transition-all duration-500"
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-455 uppercase tracking-wider pt-2 border-t border-slate-100">
                                    <span>Units Completed</span>
                                    <span className="text-slate-800">{progress.completed}/{progress.total}</span>
                                </div>
                            </div>
                        )}

                        <div className="card-enterprise bg-white overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Syllabus Index</h3>
                                {(user.role === 'mentor' || user.role === 'admin') && (
                                    <button 
                                        onClick={handleOpenCreateModal}
                                        className="w-7 h-7 bg-primary text-white rounded hover:bg-primary-hover transition-colors flex items-center justify-center cursor-pointer"
                                        title="Compose New Lesson"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                    </button>
                                )}
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {lessons.map((lesson, index) => {
                                    const isCurrent = currentLesson?.id === lesson.id;
                                    const isCompleted = progress.completed_lessons?.includes(lesson.id);
                                    return (
                                        <button 
                                            key={lesson.id}
                                            onClick={() => { setCurrentLesson(lesson); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`w-full text-left p-4 flex items-center gap-3 transition-colors relative cursor-pointer ${isCurrent ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'}`}
                                        >
                                            {isCurrent && (
                                                <div className="absolute left-0 top-1 bottom-1 w-0.75 bg-primary rounded-r"></div>
                                            )}
                                            <div className={`w-8 h-8 rounded border flex items-center justify-center text-[10px] font-bold leading-none shrink-0 ${isCurrent ? 'bg-primary border-primary text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-xs truncate ${isCurrent ? 'text-primary' : 'text-slate-800'}`}>
                                                    {lesson.title}
                                                </p>
                                                {isCompleted ? (
                                                    <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                                        <FontAwesomeIcon icon={faCheckCircle} /> Completed
                                                    </span>
                                                ) : (
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                                        <FontAwesomeIcon icon={faPlayCircle} /> Pending
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                                {lessons.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                                        No lessons published.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compose / Edit Lesson Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-lg border border-slate-250 p-6 shadow-xl animate-fade-in my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                    {isEditing ? 'Edit Lesson Unit' : 'Compose Lesson Unit'}
                                </h2>
                                <p className="text-[9px] text-slate-400 font-medium mt-1">SUPPORTED FORMATS: Markdown (GFM)</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-655 cursor-pointer">
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveLesson} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Unit Title</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="e.g. Chapter 1: Architectural Foundations"
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Video Resource URL (Optional)</label>
                                <input 
                                    type="url" 
                                    className="w-full px-3 py-2 text-xs font-medium text-slate-800 border border-slate-250 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="e.g. YouTube watch URL or direct video MP4 URL"
                                    value={lessonForm.video_url}
                                    onChange={(e) => setLessonForm({...lessonForm, video_url: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Instructional Content (Markdown)</label>
                                <textarea 
                                    className="w-full px-3 py-2.5 text-xs font-mono text-slate-700 border border-slate-250 rounded h-40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y leading-relaxed"
                                    placeholder="Write lesson text. GFM features are fully enabled..."
                                    value={lessonForm.content}
                                    onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                                    required
                                />
                            </div>

                            {/* Quiz Questions Section inside Lesson Creator */}
                            <div className="border-t border-slate-150 pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lesson Quiz Questions</h3>
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Question
                                    </button>
                                </div>

                                {quizQuestions.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 italic">No comprehension quiz has been created for this lesson yet.</p>
                                ) : (
                                    <div className="space-y-4 divide-y divide-slate-100">
                                        {quizQuestions.map((q, qIdx) => (
                                            <div key={qIdx} className={`space-y-3 ${qIdx > 0 ? 'pt-4' : ''}`}>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-primary uppercase">Question {qIdx + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveQuestion(qIdx)}
                                                        className="text-rose-600 hover:text-rose-800 text-[10px] font-bold uppercase cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>

                                                <div>
                                                    <input 
                                                        type="text"
                                                        placeholder="Enter the question query..."
                                                        className="w-full px-3 py-1.5 text-xs font-medium text-slate-800 border border-slate-200 rounded focus:outline-none focus:border-primary"
                                                        value={q.question}
                                                        onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-bold text-slate-450 uppercase">{String.fromCharCode(65 + oIdx)}:</span>
                                                            <input 
                                                                type="text"
                                                                placeholder={`Option ${oIdx + 1}`}
                                                                className="flex-1 px-2.5 py-1 text-xs font-medium text-slate-855 border border-slate-200 rounded focus:outline-none"
                                                                value={opt}
                                                                onChange={(e) => handleUpdateOption(qIdx, oIdx, e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <label className="text-[10px] font-bold text-slate-455 uppercase whitespace-nowrap">Correct Choice:</label>
                                                    <select
                                                        className="px-2.5 py-1 text-xs font-medium text-slate-855 border border-slate-200 rounded bg-white focus:outline-none"
                                                        value={q.answer}
                                                        onChange={(e) => handleUpdateAnswer(qIdx, e.target.value)}
                                                    >
                                                        {q.options.map((_, oIdx) => (
                                                            <option key={oIdx} value={oIdx}>
                                                                Option {String.fromCharCode(65 + oIdx)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                >
                                    Save Unit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ModuleView;
