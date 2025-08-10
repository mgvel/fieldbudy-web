import { Sidebar } from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { Outlet } from 'react-router-dom';
import { API_BASE_URL } from '../../api/config';
import { useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
 
export function DashboardLayout() {
  const { User } = useAuthStore((state) => ({
    User: state.user,
  }));

  const setProjects = useDashboardStore((state) => state.setProjects);
  const setUsers = useDashboardStore((state) => state.setUsers);



  const getProjects = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/project?page=1&limit=200`);
      setProjects(response.data.payload.docs)
    } catch (error) {
      console.log(error)
    }
  };
  
  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/user?page=1&limit=10`);
      if (response.data?.status === 'success') {
        setUsers(response.data.payload.docs);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    getProjects();
    getAllUsers();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-64 fixed inset-y-0 left-0 bg-white border-r z-50">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 pl-64">
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          <Header auth={User} />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:px-6  bg-gray-50">
        <div className="w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
