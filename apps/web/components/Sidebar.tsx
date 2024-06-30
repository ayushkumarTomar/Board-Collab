import React from 'react';

interface SidebarProps {
  numberOfUsers: number;
}

const Sidebar: React.FC<SidebarProps> = ({ numberOfUsers }) => {
    return (
      <div className="w-32 h-screen bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <ul>
          {Array.from({ length: numberOfUsers }, (_, index) => (
            <li key={index} className="mb-2">
              User {index + 1}
            </li>
          ))}
        </ul>
      </div>
    );
  };

export default Sidebar;
