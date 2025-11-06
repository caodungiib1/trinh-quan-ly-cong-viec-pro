import React, { useState, useMemo, useCallback, FC, useEffect } from 'react';
import { CongViec, DuAn, NguoiDung, TrangThai, DoUuTien, VaiTro } from './types';
import { CONG_VIEC_DATA, DU_AN_DATA, NGUOI_DUNG_DATA } from './constants';
// FIX: Module '"date-fns"' has no exported member for several functions. Import them from submodules and remove unused 'set'.
import { format, endOfWeek, eachDayOfInterval, addDays, getISOWeek, getMonth, getYear, endOfMonth, isSameDay, isSameMonth, addMonths, isBefore, isToday, getDaysInMonth, getDate, formatISO, endOfDay } from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import subDays from 'date-fns/subDays';
import parseISO from 'date-fns/parseISO';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
// FIX: Module '"date-fns/locale"' has no exported member 'vi'.
import vi from 'date-fns/locale/vi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Tab = 'tuần' | 'thống kê' | 'lịch' | 'quản lý';

const PRIORITY_STYLES: Record<DoUuTien, string> = {
  [DoUuTien.Cao]: 'border-l-4 border-red-500',
  [DoUuTien.TrungBinh]: 'border-l-4 border-yellow-500',
  [DoUuTien.Thap]: 'border-l-4 border-blue-500',
};

const STATUS_STYLES: Record<TrangThai, { bg: string; text: string; dot: string }> = {
  [TrangThai.CanLam]: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' },
  [TrangThai.DangLam]: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-400' },
  [TrangThai.DaXong]: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-400' },
  [TrangThai.BiHuy]: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-400' },
};

const PROJECT_COLORS = [
    { name: 'Xanh dương', value: 'bg-blue-500' },
    { name: 'Xanh lá', value: 'bg-green-500' },
    { name: 'Tím', value: 'bg-purple-500' },
    { name: 'Vàng', value: 'bg-yellow-500' },
    { name: 'Đỏ', value: 'bg-red-500' },
    { name: 'Cam', value: 'bg-orange-500' },
    { name: 'Hồng', value: 'bg-pink-500' },
];


// Sub-Components
interface TaskCardProps {
  task: CongViec;
  project?: DuAn;
  assignee?: NguoiDung;
  onEdit: (task: CongViec) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

const TaskCard: FC<TaskCardProps> = ({ task, project, assignee, onEdit, onDragStart }) => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onEdit(task)}
      className={`bg-white p-3 rounded-lg shadow mb-3 cursor-pointer hover:shadow-md transition-shadow duration-200 ${PRIORITY_STYLES[task.doUuTien]}`}
    >
      <div className="flex justify-between items-start">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${project?.mauSac} text-white`}>
          {project?.ten || 'Không có dự án'}
        </span>
        {assignee && <img src={assignee.avatar} alt={assignee.ten} className="w-8 h-8 rounded-full border-2 border-white" title={assignee.ten} />}
      </div>
      <h4 className="font-bold mt-2 text-gray-800">{task.tieuDe}</h4>
      <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
        <span className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs ${STATUS_STYLES[task.trangThai].bg} ${STATUS_STYLES[task.trangThai].text}`}>
          <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[task.trangThai].dot}`}></span>
          {task.trangThai}
        </span>
        <span className="flex items-center gap-1">
          <i className="far fa-calendar-alt"></i>
          {format(parseISO(task.hanChot), 'dd/MM')}
        </span>
      </div>
    </div>
);

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
}

const KpiCard: FC<KpiCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white text-2xl`}>
            <i className={icon}></i>
        </div>
        <div className="ml-4">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const App: FC = () => {
    const [tasks, setTasks] = useState<CongViec[]>(() => {
        try {
            const saved = localStorage.getItem('tasks');
            return saved ? JSON.parse(saved) : CONG_VIEC_DATA;
        } catch {
            return CONG_VIEC_DATA;
        }
    });
    const [projects, setProjects] = useState<DuAn[]>(() => {
        try {
            const saved = localStorage.getItem('projects');
            return saved ? JSON.parse(saved) : DU_AN_DATA;
        } catch {
            return DU_AN_DATA;
        }
    });
    const [users, setUsers] = useState<NguoiDung[]>(() => {
        try {
            const saved = localStorage.getItem('users');
            return saved ? JSON.parse(saved) : NGUOI_DUNG_DATA;
        } catch {
            return NGUOI_DUNG_DATA;
        }
    });
    const [currentUser, setCurrentUser] = useState<NguoiDung | null>(() => {
        try {
            const saved = localStorage.getItem('currentUser');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);
    
    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);


    const [activeTab, setActiveTab] = useState<Tab>('tuần');
    const [currentDate, setCurrentDate] = useState(new Date());

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<CongViec | null>(null);

    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<DuAn | null>(null);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<NguoiDung | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'project' | 'user' } | null>(null);
    
    // Organization-scoped data
    const organizationUsers = useMemo(() => users.filter(u => u.maToChuc === currentUser?.maToChuc), [users, currentUser]);
    const organizationProjects = useMemo(() => projects.filter(p => p.maToChuc === currentUser?.maToChuc), [projects, currentUser]);
    const organizationTasks = useMemo(() => tasks.filter(t => t.maToChuc === currentUser?.maToChuc), [tasks, currentUser]);

    const availableTabs = useMemo(() => {
        if (currentUser?.vaiTro === VaiTro.QuanTri) {
            return ['tuần', 'thống kê', 'lịch', 'quản lý'] as Tab[];
        }
        return ['tuần', 'thống kê', 'lịch'] as Tab[];
    }, [currentUser]);

    useEffect(() => {
        if (!availableTabs.includes(activeTab)) {
            setActiveTab('tuần');
        }
    }, [availableTabs, activeTab]);

    const visibleTasks = useMemo(() => {
        if (currentUser?.vaiTro === VaiTro.NhanVien) {
            return organizationTasks.filter(t => t.nguoiPhuTrachId === currentUser.id);
        }
        return organizationTasks;
    }, [organizationTasks, currentUser]);

    // Auth Handlers
    const handleLogin = (username: string, password: string): boolean => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        alert('Tên đăng nhập hoặc mật khẩu không đúng!');
        return false;
    };
    const handleRegister = (newUser: Omit<NguoiDung, 'id'>) => {
        if (users.some(u => u.username === newUser.username)) {
            alert('Tên đăng nhập đã tồn tại!');
            return;
        }

        if (newUser.vaiTro === VaiTro.QuanTri) {
            const newOrgCode = `ORG-${Date.now().toString(36).toUpperCase()}`;
            const userToSave: NguoiDung = { ...newUser, id: `tv${Date.now()}`, maToChuc: newOrgCode };
            setUsers([...users, userToSave]);
            setCurrentUser(userToSave);
            setTimeout(() => alert(`Đăng ký quản trị thành công!\n\nMã tổ chức của bạn là: ${newOrgCode}\n\nVui lòng lưu lại mã này để chia sẻ cho nhân viên.`), 100);
        } else { // Employee
            if (!newUser.maToChuc) {
                alert('Vui lòng nhập mã tổ chức.');
                return;
            }
            const orgExists = users.some(u => u.vaiTro === VaiTro.QuanTri && u.maToChuc === newUser.maToChuc);
            if (!orgExists) {
                alert('Mã tổ chức không hợp lệ.');
                return;
            }
            const userToSave: NguoiDung = { ...newUser, id: `tv${Date.now()}`};
            setUsers([...users, userToSave]);
            setCurrentUser(userToSave);
        }
    };
    const handleLogout = () => {
        setCurrentUser(null);
    };

    // Task Modal Handlers
    const handleOpenTaskModal = (task: CongViec | null) => {
      setEditingTask(task);
      setIsTaskModalOpen(true);
    };
    const handleCloseTaskModal = () => {
      setEditingTask(null);
      setIsTaskModalOpen(false);
    };
    const handleSaveTask = (taskToSave: CongViec) => {
        let taskList = [...tasks];
        if (editingTask) {
            let updatedTask = { ...taskToSave };
            // FIX: Cannot find name 'taskTosave'. Did you mean 'taskToSave'?
            if (taskToSave.trangThai === TrangThai.DaXong && !taskToSave.ngayHoanThanh) {
                updatedTask.ngayHoanThanh = formatISO(new Date(), { representation: 'date' });
            } else if (taskToSave.trangThai !== TrangThai.DaXong) {
                updatedTask.ngayHoanThanh = null;
            }
            taskList = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        } else {
            const project = organizationProjects.find(p => p.id === taskToSave.duAnId);
            if (!project) {
                alert("Dự án được chọn không hợp lệ!");
                return;
            }
            const newTask = { ...taskToSave, id: `cv${Date.now()}`, maToChuc: project.maToChuc };
            taskList.push(newTask);
        }
        setTasks(taskList);
        handleCloseTaskModal();
    };

    // Project Modal Handlers
    const handleOpenProjectModal = (project: DuAn | null) => {
        setEditingProject(project);
        setIsProjectModalOpen(true);
    };
    const handleCloseProjectModal = () => {
        setEditingProject(null);
        setIsProjectModalOpen(false);
    };
    const handleSaveProject = (projectToSave: DuAn) => {
        if(editingProject) {
            setProjects(projects.map(p => p.id === projectToSave.id ? projectToSave : p));
        } else {
            if (!currentUser) return;
            setProjects([...projects, { ...projectToSave, id: `da${Date.now()}`, maToChuc: currentUser.maToChuc }]);
        }
        handleCloseProjectModal();
    };
    const handleDeleteProject = (projectId: string) => {
        setItemToDelete({ id: projectId, type: 'project' });
    };
    
    // User Modal Handlers
    const handleOpenUserModal = (user: NguoiDung | null) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };
    const handleCloseUserModal = () => {
        setEditingUser(null);
        setIsUserModalOpen(false);
    };
    const handleSaveUser = (userToSave: NguoiDung) => {
        if(editingUser) {
            setUsers(users.map(m => m.id === userToSave.id ? userToSave : m));
        } else {
            if (users.some(u => u.username === userToSave.username)) {
                alert('Tên đăng nhập đã tồn tại!');
                return;
            }
            if (!currentUser) return;
            setUsers([...users, { ...userToSave, id: `tv${Date.now()}`, maToChuc: currentUser.maToChuc }]);
        }
        handleCloseUserModal();
    };
    const handleDeleteUser = (userId: string) => {
        if (currentUser && userId === currentUser.id) {
            alert("Bạn không thể tự xóa tài khoản của mình.");
            return;
        }
        setItemToDelete({ id: userId, type: 'user' });
    };
    
    // Deletion Confirmation Handlers
    const confirmDeletion = () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'project') {
            setProjects(projects => projects.filter(p => p.id !== itemToDelete.id));
            setTasks(tasks => tasks.map(t => t.duAnId === itemToDelete.id ? { ...t, duAnId: '' } : t));
        } else if (itemToDelete.type === 'user') {
            setUsers(users => users.filter(m => m.id !== itemToDelete.id));
            setTasks(tasks => tasks.map(t => t.nguoiPhuTrachId === itemToDelete.id ? { ...t, nguoiPhuTrachId: '' } : t));
        }

        setItemToDelete(null); // Close the modal
    };

    const cancelDeletion = () => {
        setItemToDelete(null);
    };


    // Main Views
    const renderContent = () => {
        switch (activeTab) {
            case 'tuần':
                return <WeeklyView currentDate={currentDate} setCurrentDate={setCurrentDate} tasks={visibleTasks} projects={organizationProjects} members={organizationUsers} onEditTask={handleOpenTaskModal} setTasks={setTasks} />;
            case 'thống kê':
                return <MonthlyStatsView currentDate={currentDate} setCurrentDate={setCurrentDate} tasks={visibleTasks} />;
            case 'lịch':
                return <CalendarView currentDate={currentDate} setCurrentDate={setCurrentDate} tasks={visibleTasks} projects={organizationProjects} members={organizationUsers} onEditTask={handleOpenTaskModal} />;
            case 'quản lý':
                return currentUser?.vaiTro === VaiTro.QuanTri ? <ManagementView 
                            projects={organizationProjects}
                            users={organizationUsers}
                            onAddProject={() => handleOpenProjectModal(null)}
                            onEditProject={handleOpenProjectModal}
                            onDeleteProject={handleDeleteProject}
                            onAddUser={() => handleOpenUserModal(null)}
                            onEditUser={handleOpenUserModal}
                            onDeleteUser={handleDeleteUser}
                        /> : null;
            default:
                return null;
        }
    };

    if (!currentUser) {
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <header className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-lg">
                            <i className="fas fa-check-double text-xl"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Trình quản lý công việc</h1>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <nav>
                            <ul className="flex items-center bg-gray-200 rounded-lg p-1">
                                {availableTabs.map(tab => (
                                    <li key={tab}>
                                        <button
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 capitalize ${activeTab === tab ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            {tab}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="flex items-center gap-2">
                            <img src={currentUser.avatar} alt={currentUser.ten} className="w-9 h-9 rounded-full border-2 border-primary" />
                            <div>
                                <p className="font-semibold text-sm text-gray-800">{currentUser.ten}</p>
                                <p className="text-xs text-gray-500">{currentUser.vaiTro}</p>
                            </div>
                            <button onClick={handleLogout} title="Đăng xuất" className="ml-2 text-gray-500 hover:text-danger p-2 rounded-full hover:bg-gray-100">
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main>
                {renderContent()}
            </main>
            {isTaskModalOpen && <TaskModal task={editingTask} onSave={handleSaveTask} onClose={handleCloseTaskModal} projects={organizationProjects} members={organizationUsers} />}
            {isProjectModalOpen && <ProjectModal project={editingProject} onSave={handleSaveProject} onClose={handleCloseProjectModal} />}
            {isUserModalOpen && <UserModal user={editingUser} onSave={handleSaveUser} onClose={handleCloseUserModal} />}
            {itemToDelete && (
                <ConfirmationModal
                    title={itemToDelete.type === 'project' ? 'Xác nhận xóa Dự án' : 'Xác nhận xóa Thành viên'}
                    message={
                        itemToDelete.type === 'project'
                        ? 'Bạn có chắc chắn muốn xóa dự án này không?\n\nTất cả công việc thuộc dự án này sẽ bị hủy liên kết (nhưng không bị xóa).\n\nHành động này sẽ không thể hoàn tác.'
                        : 'Bạn có chắc chắn muốn xóa thành viên này không?\n\nTất cả công việc được giao cho thành viên này sẽ bị hủy phân công (nhưng không bị xóa).\n\nHành động này sẽ không thể hoàn tác.'
                    }
                    onConfirm={confirmDeletion}
                    onCancel={cancelDeletion}
                />
            )}
        </div>
    );
};

const AuthPage: FC<{onLogin: (u: string, p: string) => boolean, onRegister: (u: Omit<NguoiDung, 'id'>) => void}> = ({ onLogin, onRegister }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerData, setRegisterData] = useState({
        ten: '', username: '', password: '', avatar: '', vaiTro: VaiTro.NhanVien, maToChuc: ''
    });
    const [error, setError] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!onLogin(loginUsername, loginPassword)) {
            setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!registerData.ten || !registerData.username || !registerData.password || !registerData.avatar) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        if (registerData.vaiTro === VaiTro.NhanVien && !registerData.maToChuc) {
            setError('Nhân viên phải nhập mã tổ chức.');
            return;
        }
        onRegister(registerData);
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center bg-primary text-white w-14 h-14 rounded-xl mb-4">
                        <i className="fas fa-check-double text-2xl"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Chào mừng bạn!</h1>
                    <p className="text-gray-500 mt-2">{isLoginView ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}</p>
                </div>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

                {isLoginView ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                            <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3" required />
                        </div>
                        <button type="submit" className="w-full p-3 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors font-semibold">Đăng nhập</button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <input type="text" name="ten" placeholder="Họ và tên" value={registerData.ten} onChange={handleRegisterChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-3" required />
                        <input type="text" name="username" placeholder="Tên đăng nhập" value={registerData.username} onChange={handleRegisterChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-3" required />
                        <input type="password" name="password" placeholder="Mật khẩu" value={registerData.password} onChange={handleRegisterChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-3" required />
                        <input type="text" name="avatar" placeholder="URL Avatar" value={registerData.avatar} onChange={handleRegisterChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-3" required />
                        <select name="vaiTro" value={registerData.vaiTro} onChange={handleRegisterChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-white">
                            <option value={VaiTro.NhanVien}>Nhân viên</option>
                            <option value={VaiTro.QuanTri}>Quản trị</option>
                        </select>
                         {registerData.vaiTro === VaiTro.NhanVien && (
                            <input type="text" name="maToChuc" placeholder="Mã tổ chức" value={registerData.maToChuc} onChange={handleRegisterChange} className="block w-full border border-gray-300 rounded-md shadow-sm p-3" required />
                        )}
                        <button type="submit" className="w-full p-3 bg-secondary text-white rounded-md hover:bg-emerald-600 transition-colors font-semibold">Đăng ký</button>
                    </form>
                )}
                
                <p className="text-center text-sm text-gray-600">
                    {isLoginView ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-primary hover:underline ml-1">
                        {isLoginView ? "Đăng ký" : "Đăng nhập"}
                    </button>
                </p>
            </div>
        </div>
    );
};

const DailyCompletionDonut: FC<{ tasks: CongViec[] }> = ({ tasks }) => {
    const total = tasks.length;
    if (total === 0) {
        return <div className="w-10 h-10"></div>; // Placeholder to keep alignment
    }
    const completed = tasks.filter(t => t.trangThai === TrangThai.DaXong).length;
    const percentage = Math.round((completed / total) * 100);

    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-10 h-10 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 44 44">
                <circle
                    className="text-gray-300"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="22"
                    cy="22"
                />
                <circle
                    className="text-secondary"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="22"
                    cy="22"
                    transform="rotate(-90 22 22)"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-600">
                {`${percentage}%`}
            </span>
        </div>
    );
};

// Weekly View Component
interface WeeklyViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  tasks: CongViec[];
  projects: DuAn[];
  members: NguoiDung[];
  onEditTask: (task: CongViec | null) => void;
  setTasks: React.Dispatch<React.SetStateAction<CongViec[]>>;
}

const WeeklyView: FC<WeeklyViewProps> = ({ currentDate, setCurrentDate, tasks, projects, members, onEditTask, setTasks }) => {
    const [filters, setFilters] = useState({ status: 'all', project: 'all', member: 'all' });

    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
    }, [currentDate]);

    const filteredTasks = useMemo(() => {
        const start = weekDays[0];
        const end = weekDays[6];
        return tasks.filter(task => {
            const taskDate = parseISO(task.ngay);
            const isSameWeek = taskDate >= start && taskDate <= end;
            const statusMatch = filters.status === 'all' || task.trangThai === filters.status;
            const projectMatch = filters.project === 'all' || task.duAnId === filters.project;
            const memberMatch = filters.member === 'all' || task.nguoiPhuTrachId === filters.member;
            return isSameWeek && statusMatch && projectMatch && memberMatch;
        });
    }, [tasks, weekDays, filters]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ngay: formatISO(day, { representation: 'date' }) } : task
            )
        );
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    return (
        <div>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-left"></i></button>
                        <h2 className="text-xl font-bold text-gray-700 text-center">
                           Tuần {getISOWeek(currentDate)} ({format(weekDays[0], 'dd/MM')} - {format(weekDays[6], 'dd/MM/yyyy')})
                        </h2>
                        <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <select onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} className="w-full p-2 border rounded-md bg-gray-50">
                        <option value="all">Tất cả trạng thái</option>
                        {Object.values(TrangThai).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select onChange={(e) => setFilters(f => ({ ...f, project: e.target.value }))} className="w-full p-2 border rounded-md bg-gray-50">
                        <option value="all">Tất cả dự án</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.ten}</option>)}
                    </select>
                    <select onChange={(e) => setFilters(f => ({ ...f, member: e.target.value }))} className="w-full p-2 border rounded-md bg-gray-50">
                        <option value="all">Tất cả thành viên</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.ten}</option>)}
                    </select>
                    <button onClick={() => onEditTask(null)} className="w-full p-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <i className="fas fa-plus"></i> Thêm công việc
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {weekDays.map(day => {
                    const tasksOnDay = filteredTasks.filter(task => isSameDay(parseISO(task.ngay), day));
                    return (
                        <div
                        key={day.toString()}
                        className="bg-gray-200 rounded-lg p-3 min-h-[300px]"
                        onDrop={(e) => handleDrop(e, day)}
                        onDragOver={handleDragOver}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-gray-700">
                                    {format(day, 'EEEE', { locale: vi })} <span className="block text-gray-500 font-normal">{format(day, 'dd/MM')}</span>
                                </h3>
                                <DailyCompletionDonut tasks={tasksOnDay} />
                            </div>
                            <div>
                                {tasksOnDay.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        project={projects.find(p => p.id === task.duAnId)}
                                        assignee={members.find(m => m.id === task.nguoiPhuTrachId)}
                                        onEdit={onEditTask}
                                        onDragStart={handleDragStart}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// Monthly Stats View
interface MonthlyStatsViewProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    tasks: CongViec[];
}

const MonthlyStatsView: FC<MonthlyStatsViewProps> = ({ currentDate, setCurrentDate, tasks }) => {
    
    const monthlyTasks = useMemo(() => tasks.filter(t => isSameMonth(parseISO(t.ngay), currentDate)), [tasks, currentDate]);

    const stats = useMemo(() => {
        const completed = monthlyTasks.filter(t => t.trangThai === TrangThai.DaXong).length;
        const overdue = monthlyTasks.filter(t => isBefore(endOfDay(parseISO(t.hanChot)), new Date()) && t.trangThai !== TrangThai.DaXong).length;
        const total = monthlyTasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, overdue, completionRate };
    }, [monthlyTasks, currentDate]);
    
    const barChartData = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentDate);
        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const tasksOnDay = monthlyTasks.filter(t => getDate(parseISO(t.ngay)) === day);
            return {
                name: `Ngày ${day}`,
                "Hoàn thành": tasksOnDay.filter(t => t.trangThai === TrangThai.DaXong).length,
                "Tạo mới": tasksOnDay.length,
            };
        });
    }, [monthlyTasks, currentDate]);

    const lineChartData = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentDate);
        let cumulativeCompleted = 0;
        const data = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const newlyCompletedOnDay = monthlyTasks.filter(
                t => t.trangThai === TrangThai.DaXong && t.ngayHoanThanh && getDate(parseISO(t.ngayHoanThanh)) === day
            ).length;
            cumulativeCompleted += newlyCompletedOnDay;
            return {
                name: `Ngày ${day}`,
                "Hoàn thành": cumulativeCompleted,
            };
        });
        return data;
    }, [monthlyTasks, currentDate]);

    return (
      <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700">Thống kê tháng</h2>
              <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-left"></i></button>
                  <span className="font-semibold text-lg">
                      {format(currentDate, 'MMMM yyyy', { locale: vi })}
                  </span>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-right"></i></button>
              </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <KpiCard title="Tổng công việc" value={stats.total} icon="fas fa-tasks" color="bg-info" />
              <KpiCard title="Đã hoàn thành" value={stats.completed} icon="fas fa-check-circle" color="bg-secondary" />
              <KpiCard title="% Hoàn thành" value={`${stats.completionRate}%`} icon="fas fa-chart-pie" color="bg-primary" />
              <KpiCard title="Quá hạn" value={stats.overdue} icon="fas fa-exclamation-triangle" color="bg-danger" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold text-gray-700 mb-4">Công việc theo ngày</h3>
                  <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Tạo mới" fill="#3b82f6" />
                          <Bar dataKey="Hoàn thành" fill="#10b981" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
               <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold text-gray-700 mb-4">Tiến độ hoàn thành tháng</h3>
                  <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="Hoàn thành" stroke="#10b981" strokeWidth={2} name="Hoàn thành tích lũy" />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-700 mb-4">Bảng chi tiết công việc</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                              <th scope="col" className="px-6 py-3">Công việc</th>
                              <th scope="col" className="px-6 py-3">Trạng thái</th>
                              <th scope="col" className="px-6 py-3">Hạn chót</th>
                              <th scope="col" className="px-6 py-3">Ưu tiên</th>
                          </tr>
                      </thead>
                      <tbody>
                          {monthlyTasks.map(task => (
                              <tr key={task.id} className="bg-white border-b">
                                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{task.tieuDe}</th>
                                  <td className="px-6 py-4">{task.trangThai}</td>
                                  <td className="px-6 py-4">{format(parseISO(task.hanChot), 'dd/MM/yyyy')}</td>
                                  <td className="px-6 py-4">{task.doUuTien}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    );
};

// Calendar View
interface CalendarViewProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    tasks: CongViec[];
    projects: DuAn[];
    members: NguoiDung[];
    onEditTask: (task: CongViec | null) => void;
}

const CalendarView: FC<CalendarViewProps> = ({ currentDate, setCurrentDate, tasks, projects, onEditTask }) => {
    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const weekHeader = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-left"></i></button>
                <h2 className="text-xl font-bold text-gray-700 capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: vi })}
                </h2>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-200"><i className="fas fa-chevron-right"></i></button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
                {weekHeader.map(day => (
                    <div key={day} className="text-center font-semibold py-2 bg-gray-100 text-gray-600">{day}</div>
                ))}
                {calendarDays.map(day => {
                    const tasksOnDay = tasks.filter(t => isSameDay(parseISO(t.ngay), day));
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodaysDate = isToday(day);

                    return (
                        <div key={day.toString()} className={`relative min-h-[120px] p-2 bg-white ${isCurrentMonth ? '' : 'bg-gray-50'}`}>
                            <span className={`absolute top-2 right-2 text-sm font-semibold ${isTodaysDate ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : (isCurrentMonth ? 'text-gray-700' : 'text-gray-400')}`}>
                                {format(day, 'd')}
                            </span>
                            <div className="mt-8 space-y-1">
                                {tasksOnDay.map(task => {
                                    const project = projects.find(p => p.id === task.duAnId);
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => onEditTask(task)}
                                            className={`w-full text-left p-1 rounded-md text-xs truncate cursor-pointer text-white ${project?.mauSac || 'bg-gray-400'}`}
                                        >
                                           {task.tieuDe}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// Management View
interface ManagementViewProps {
    projects: DuAn[];
    users: NguoiDung[];
    onAddProject: () => void;
    onEditProject: (project: DuAn) => void;
    onDeleteProject: (id: string) => void;
    onAddUser: () => void;
    onEditUser: (user: NguoiDung) => void;
    onDeleteUser: (id: string) => void;
}

const ManagementView: FC<ManagementViewProps> = ({ projects, users, onAddProject, onEditProject, onDeleteProject, onAddUser, onEditUser, onDeleteUser }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Management */}
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Quản lý Dự án</h2>
                <button onClick={onAddProject} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm">
                    <i className="fas fa-plus"></i> Thêm Dự án
                </button>
            </div>
            <ul className="space-y-3">
                {projects.map(p => (
                    <li key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                            <span className={`w-4 h-4 rounded-full ${p.mauSac}`}></span>
                            <span className="font-medium text-gray-700">{p.ten}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => onEditProject(p)} className="text-gray-500 hover:text-blue-600"><i className="fas fa-pencil-alt"></i></button>
                            <button onClick={() => onDeleteProject(p.id)} className="text-gray-500 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        
        {/* User Management */}
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Quản lý Thành viên</h2>
                <button onClick={onAddUser} className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-emerald-600 flex items-center gap-2 text-sm">
                    <i className="fas fa-plus"></i> Thêm Thành viên
                </button>
            </div>
             <ul className="space-y-3">
                {users.map(m => (
                    <li key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                            <img src={m.avatar} alt={m.ten} className="w-8 h-8 rounded-full" />
                            <span className="font-medium text-gray-700">{m.ten}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => onEditUser(m)} className="text-gray-500 hover:text-blue-600"><i className="fas fa-pencil-alt"></i></button>
                            <button onClick={() => onDeleteUser(m.id)} className="text-gray-500 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


// Task Modal
interface TaskModalProps {
    task: CongViec | null;
    onSave: (task: CongViec) => void;
    onClose: () => void;
    projects: DuAn[];
    members: NguoiDung[];
}

const TaskModal: FC<TaskModalProps> = ({ task, onSave, onClose, projects, members }) => {
    const [formData, setFormData] = useState<CongViec>(
        task || {
            id: '',
            tieuDe: '',
            moTa: '',
            trangThai: TrangThai.CanLam,
            doUuTien: DoUuTien.TrungBinh,
            ngay: formatISO(new Date(), { representation: 'date' }),
            hanChot: formatISO(new Date(), { representation: 'date' }),
            nguoiPhuTrachId: members[0]?.id || '',
            duAnId: projects[0]?.id || '',
            maToChuc: '', // Will be set on save
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">{task ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                                <input type="text" name="tieuDe" value={formData.tieuDe} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <textarea name="moTa" value={formData.moTa} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Người phụ trách</label>
                                    <select name="nguoiPhuTrachId" value={formData.nguoiPhuTrachId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                        {members.map(m => <option key={m.id} value={m.id}>{m.ten}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dự án</label>
                                    <select name="duAnId" value={formData.duAnId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.ten}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngày thực hiện</label>
                                    <input type="date" name="ngay" value={formData.ngay} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hạn chót</label>
                                    <input type="date" name="hanChot" value={formData.hanChot} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    <select name="trangThai" value={formData.trangThai} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                        {Object.values(TrangThai).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Độ ưu tiên</label>
                                    <select name="doUuTien" value={formData.doUuTien} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                        {Object.values(DoUuTien).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700">{task ? 'Lưu thay đổi' : 'Tạo mới'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Project Modal
interface ProjectModalProps {
    project: DuAn | null;
    onSave: (project: DuAn) => void;
    onClose: () => void;
}
const ProjectModal: FC<ProjectModalProps> = ({ project, onSave, onClose }) => {
    const [formData, setFormData] = useState(project || { id: '', ten: '', mauSac: PROJECT_COLORS[0].value, maToChuc: '' });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{project ? 'Chỉnh sửa Dự án' : 'Thêm Dự án mới'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên dự án</label>
                            <input type="text" value={formData.ten} onChange={e => setFormData({ ...formData, ten: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                             <select value={formData.mauSac} onChange={e => setFormData({ ...formData, mauSac: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                {PROJECT_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                             </select>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-100 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700">Lưu</button>
                </div>
            </form>
        </div>
    );
};

// User Modal
interface UserModalProps {
    user: NguoiDung | null;
    onSave: (user: NguoiDung) => void;
    onClose: () => void;
}
const UserModal: FC<UserModalProps> = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState(user || { id: '', ten: '', avatar: '', username: '', password: '', vaiTro: VaiTro.NhanVien, maToChuc: '' });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.ten || !formData.username || !formData.password || !formData.avatar) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{user ? 'Chỉnh sửa Thành viên' : 'Thêm Thành viên mới'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên thành viên</label>
                            <input type="text" value={formData.ten} onChange={e => setFormData({ ...formData, ten: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">URL Avatar</label>
                            <input type="text" value={formData.avatar} onChange={e => setFormData({ ...formData, avatar: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                            <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required disabled={!!user} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                            <select value={formData.vaiTro} onChange={e => setFormData({ ...formData, vaiTro: e.target.value as VaiTro })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                                <option value={VaiTro.NhanVien}>Nhân viên</option>
                                <option value={VaiTro.QuanTri}>Quản trị</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-100 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-md shadow-sm text-sm font-medium hover:bg-emerald-600">Lưu</button>
                </div>
            </form>
        </div>
    );
};

// Confirmation Modal
interface ConfirmationModalProps {
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel, confirmButtonText = 'Xóa', cancelButtonText = 'Hủy' }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <i className="fas fa-exclamation-triangle text-red-600"></i>
                    </div>
                    <div className="mt-0 text-left">
                        <h3 className="text-lg leading-6 font-bold text-gray-900">{title}</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 whitespace-pre-line">{message}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-100 px-6 py-3 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {cancelButtonText}
                </button>
                <button type="button" onClick={onConfirm} className="px-4 py-2 bg-danger border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700">
                    {confirmButtonText}
                </button>
            </div>
        </div>
    </div>
);


export default App;
