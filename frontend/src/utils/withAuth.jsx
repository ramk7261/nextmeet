import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Higher-Order Component that protects routes.
 * Redirects to /auth if no JWT token found in localStorage.
 */
const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();

        useEffect(() => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth');
            }
        }, [navigate]);

        // Don't render the wrapped component if not authenticated
        const token = localStorage.getItem('token');
        if (!token) return null;

        return <WrappedComponent {...props} />;
    };

    AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
    return AuthComponent;
};

export default withAuth;
