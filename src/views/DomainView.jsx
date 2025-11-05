import { Outlet, useParams, Link } from "react-router-dom";

export default function DomainView() {
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">{id}</h1>

      {/* Button to load CSS editor in right pane */}
      <Link
        className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400"
        to={`/domain/${id}/css`}
      >
        🎨 Edit CSS
      </Link>

      {/* Right-pane outlet */}
      <div className="mt-4 border rounded p-3">
        <Outlet />
      </div>
    </div>
  );
}
