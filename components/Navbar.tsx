import { Role } from '@/lib/auth';

interface NavbarProps {
  username: string;
  role: Role;
  showAdmin?: boolean;
}

export default function Navbar({ username, role, showAdmin }: NavbarProps) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">GITCO</span>
        <span className="navbar-divider" />
        <span className="navbar-subtitle">Reporting Portal</span>
      </div>
      <div className="navbar-actions">
        {showAdmin && role === 'admin' && (
          <a className="btn btn-sm" href="/admin">⚙ Admin</a>
        )}
        {role !== 'admin' && (
          <a className="btn btn-sm" href="/reports">Reports</a>
        )}
        <div className="user-badge">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{username}</div>
            <div className="user-role">{role}</div>
          </div>
        </div>
        <form action="/api/logout" method="post">
          <button className="btn btn-sm btn-ghost btn-danger" type="submit">Sign out</button>
        </form>
      </div>
    </nav>
  );
}
