import { useAppDispatch } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

function DashboardValidator() {
  const dispatch = useAppDispatch();

  return (
    <div>
      DashboardValidator
      <button
        onClick={() => dispatch(logout())}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export default DashboardValidator;
