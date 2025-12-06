import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Route,
  CheckSquare,
  FileText,
  AlertCircle,
  Clock,
  FileSearch,
  User,
  Mail,
  Settings,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Group,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user';
import logoWide from '../../assets/logo-wide.png';

export function Sidebar() {
  const { user, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);



  const navigation = [
    { name: 'Home', href: '/', icon: Home, roles: ['all'] },
    { name: 'My Pending FB', href: '/field-buddy', icon: ClipboardList, roles: [UserRole.FieldEngineer] },
    { name: 'Site Visits', href: '/site-visits', icon: Route, roles: [UserRole.FieldEngineer] },

    { name: 'Active Projects', href: '/projects', icon: CheckSquare, roles: ['all'], parent: 'projects' },
    { name: 'Approved FB', href: '/field-buddy/approved', icon: CheckSquare, roles: [UserRole.ProjectCoordinator, UserRole.TechnicalWriter, UserRole.QualityReviewer], parent: 'projects' },
    { name: 'Rejected FB', href: '/my-rejected-fb', icon: AlertCircle, roles: [UserRole.FieldEngineer], parent: 'projects' },
    { name: 'Pending FB Reviews', href: '/fb-pending-review', icon: Clock, roles: [UserRole.EngineeringManager], parent: 'projects' },
    { name: 'Reports to Review', href: '/reports-to-be-reviewed', icon: FileSearch, roles: [UserRole.FieldEngineer], parent: 'projects' },
    { name: 'Reports to Review', href: '/fb-pending-report-review', icon: FileSearch, roles: [UserRole.EngineeringManager], parent: 'projects' },
    { name: 'Pending Draft Reports', href: '/pending-draft', icon: FileText, roles: [UserRole.TechnicalWriter], parent: 'projects' },
    { name: 'Pending QR Reports', href: '/pending-qr-reports', icon: FileSearch, roles: [UserRole.QualityReviewer], parent: 'projects' },
    {name: 'Reports to Approve', href: '/reports-to-approve', icon: FileSearch, roles: [UserRole.ReportApprover], parent: 'projects' },
    { name: 'Archived', href: '/archived-projects', icon: CheckSquare, roles: ['all'], parent: 'projects' },
    { name: 'Suspended', href: '/suspended-projects', icon: AlertCircle, roles: ['all'], parent: 'projects' },

    { name: 'Manage Users', href: '/users', icon: User, roles: [UserRole.ProjectCoordinator] },
    // { name: 'Manage Invitations', href: '/invitations', icon: Mail, roles: [UserRole.ProjectCoordinator] },
    { name: 'Activity Log', href: '/logs', icon: Settings, roles: ['all'] },
    { name: 'Status Group', href: '/status-group', icon: Group, roles: ['all'] },
    
  ];

  const isAllowed = (roles: string[]) => {
    return roles.includes('all') || roles.some(role => hasRole(role as UserRole));
  };

  const menuItems = navigation.filter(item => !item.parent && isAllowed(item.roles));
  const projectItems = navigation.filter(item => item.parent === 'projects' && isAllowed(item.roles));
  const statusGroupItem = navigation.filter(item => item.parent === 'Status Group' && isAllowed(item.roles));
  return (
    <div className="flex flex-col h-screen bg-primary text-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800">
        <img src="/img/logo-white.png" alt="Logo" className="h-8" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`flex-1 overflow-y-auto ${mobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="hidden lg:flex items-center justify-center h-16 px-4">
          <img src={logoWide}  alt="Logo" className="h-10" />
        </div>
        

        <nav className="px-2 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}

          {projectItems.length > 0 && (
            <div>
              <button
                onClick={() => setProjectsDropdownOpen(!projectsDropdownOpen)}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
              >
                <ClipboardList className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">My Projects</span>
                {projectsDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {projectsDropdownOpen && (
                <div className="pl-8 space-y-1 mt-1">
                  {projectItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

{/* {projectItems.length > 0 && (
            <div>
              <button
                onClick={() => setProjectsDropdownOpen(!projectsDropdownOpen)}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
              >
                <ClipboardList className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">My Projects</span>
                {projectsDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {statusGroupItem && (
                <div className="pl-8 space-y-1 mt-1">
                  {statusGroupItem.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className='text'>{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )} */}
        </nav>
      </div>
    </div>
  );
}
