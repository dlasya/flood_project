import Homepage from './Homepage';
import PlannerDashboard from './PlannerDashboard';
import UserDashboard from './UserDashboard';
import PredictionResults from './PredictionResults';
import CityPlannerPortal from './CityPlannerPortal';
import TestCityPlanner from './TestCityPlanner';
import SimpleCityPlanner from './SimpleCityPlanner';
import WorkingCityPlanner from './WorkingCityPlanner';
import DebugCityPlanner from './DebugCityPlanner';
import MinimalCityPlanner from './MinimalCityPlanner';
import VisualTestPlanner from './VisualTestPlanner';
import FinalCityPlanner from './FinalCityPlanner';
import UltraMinimalPlanner from './UltraMinimalPlanner';
import WorkingCityPlannerFinal from './WorkingCityPlannerFinal';
import TestAPI from './TestAPI';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Homepage,
    "prediction-results": PredictionResults,
    "PlannerDashboard": PlannerDashboard,
    "UserDashboard": UserDashboard,
    "city-planner": WorkingCityPlannerFinal,
    "test-city-planner": TestCityPlanner,
    "test-api": TestAPI,
    "city-portal": UltraMinimalPlanner,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};