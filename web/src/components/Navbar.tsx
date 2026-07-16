import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-kim-primary text-white shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center max-w-4xl">
        <Link href="/" className="text-xl font-serif font-bold tracking-wider">
          KIM Minangkabau
        </Link>
        <div className="flex space-x-4">
          <Link href="/rooms" className="hover:text-kim-yellow transition-colors font-sans text-sm font-bold">
            Lobby
          </Link>
          <Link href="/login" className="hover:text-kim-yellow transition-colors font-sans text-sm font-bold">
            Login
          </Link>
          <Link href="/admin/dashboard" className="hover:text-kim-yellow transition-colors font-sans text-sm font-bold">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
