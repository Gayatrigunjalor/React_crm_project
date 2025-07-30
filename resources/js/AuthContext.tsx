import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: any;
    userPermission: any;
    empData: any;
    login: (token: string) => void;
    saveUserRole: (details: []) => void;
    saveUserPermission: (details: []) => void;
    saveEmpData: (emp_data: []) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userRole, setUserRole] = useState([]);
    const [userPermission, setUserPermission] = useState([]);
    const [empData, setEmpData] = useState([]);

    // Simulate checking authentication status
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user_role = localStorage.getItem('user_role');
        const user_permission = localStorage.getItem('user_permission');
        const emp_data = localStorage.getItem('emp_data');
        // console.log(empData);

        if((token && token !== 'undefined') && (user_role && user_role !== 'undefined') && (user_permission && user_permission !== 'undefined') && (emp_data && emp_data !== 'undefined')) {
            setIsAuthenticated(true);
            setUserRole(JSON.parse(user_role));
            setUserPermission(JSON.parse(user_permission));
            setEmpData(JSON.parse(emp_data));
        } else {
            setIsAuthenticated(false);
            setUserRole([]);
            setUserPermission([]);
            setEmpData([]);
        }
    }, []);

    const login = (token: string) => {
        // Simulate login and set token
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const saveUserRole = (roleDetails: []) => {
        localStorage.setItem('user_role', JSON.stringify(roleDetails));
        setUserRole(roleDetails);
    };

    const saveUserPermission = (details: []) => {
        localStorage.setItem('user_permission', JSON.stringify(details));
        setUserPermission(details);
    };

    const saveEmpData = (emp_data: []) => {
        localStorage.setItem('emp_data', JSON.stringify(emp_data));
        setEmpData(emp_data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('emp_data');
        localStorage.removeItem('user_permission');
        localStorage.removeItem('user_role');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, userPermission, empData, login, saveUserRole, saveUserPermission, saveEmpData, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
