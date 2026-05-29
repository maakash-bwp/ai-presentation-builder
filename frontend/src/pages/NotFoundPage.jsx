import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slatePro-50 px-4">
      <div className="saas-card max-w-md p-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slatePro-900">404</h1>
        <p className="mt-2 text-slatePro-600">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-primary mt-6">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
