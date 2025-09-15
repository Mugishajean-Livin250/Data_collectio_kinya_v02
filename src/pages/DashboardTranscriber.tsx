import { logout } from "../features/auth/authSlice";
import { useAppDispatch} from "../app/hooks";

function DashboardTranscriber() {
  const dispatch = useAppDispatch();
  return (
    <div>DashboardTranscriber
    <button onClick= {()=> dispatch(logout())}> Logout</button>
    </div>
  )
}

export default DashboardTranscriber