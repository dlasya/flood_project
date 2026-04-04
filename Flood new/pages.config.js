import Home from './Home';
import PlannerDashboard from './PlannerDashboard';
import UserDashboard from './UserDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Login": Home,
    "PlannerDashboard": PlannerDashboard,
    "UserDashboard": UserDashboard,
}

export const pagesConfig = {
    mainPage: "UserDashboard",
    Pages: PAGES,
    Layout: __Layout,
};