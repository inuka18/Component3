import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/layout/RequireAuth";
import { ProjectScopedLayout } from "./components/layout/ProjectScopedLayout";
import { RequirePM } from "./components/layout/RequirePM";
import { LoginPage } from "./features/auth/LoginPage";
import { GlobalDashboardPage } from "./features/dashboard/GlobalDashboardPage";
import { ProjectDashboardPage } from "./features/dashboard/ProjectDashboardPage";
import { ProjectsPage } from "./features/projects/ProjectsPage";
import { RequirementsEngineLayout } from "./features/requirements/RequirementsEngineLayout";
import { RequirementsPage } from "./features/requirements/RequirementsPage";
import { NetworkMapPage } from "./features/requirements/NetworkMapPage";
import { LedgerPage } from "./features/requirements/LedgerPage";
import { AlignmentScorePage } from "./features/requirements/AlignmentScorePage";
import { SignalAnalyticsPage } from "./features/requirements/SignalAnalyticsPage";
import { GapDetectionLayout } from "./features/gap-detection/GapDetectionLayout";
import { GapOverviewPage } from "./features/gap-detection/GapOverviewPage";
import { GapWorkspacePage } from "./features/gap-detection/GapWorkspacePage";
import { GapInventoryPage } from "./features/gap-detection/GapInventoryPage";
import { ImpactPropagationPage } from "./features/gap-detection/ImpactPropagationPage";
import { ImpactAssessmentPage } from "./features/gap-detection/ImpactAssessmentPage";
import { ScheduleLayout } from "./features/schedule/ScheduleLayout";
import { ScheduleOverviewPage } from "./features/schedule/ScheduleOverviewPage";
import { DayViewPage } from "./features/schedule/DayViewPage";
import { WeekViewPage } from "./features/schedule/WeekViewPage";
import { SprintViewPage } from "./features/schedule/SprintViewPage";
import { ProjectTimelinePage } from "./features/schedule/ProjectTimelinePage";
import { KanbanBoardPage } from "./features/board/KanbanBoardPage";
import { TeamPage } from "./features/team/TeamPage";
import { MeetingsPage } from "./features/meetings/MeetingsPage";
import { RetroIntelligenceLayout } from "./features/retro-intelligence/RetroIntelligenceLayout";
import { RetrospectivesListPage } from "./features/retro-intelligence/RetrospectivesListPage";
import { RIOverviewPage } from "./features/retro-intelligence/RIOverviewPage";
import { CrossValidationPage } from "./features/retro-intelligence/CrossValidationPage";
import { ActionTrackerPage } from "./features/retro-intelligence/ActionTrackerPage";
import { EvidenceLedgerPage } from "./features/retro-intelligence/EvidenceLedgerPage";
import { LearningLoopPage } from "./features/retro-intelligence/LearningLoopPage";
import { ReportsPage as RIReportsPage } from "./features/retro-intelligence/ReportsPage";
import { ProjectSettingsPage } from "./features/settings/ProjectSettingsPage";
import { AccountSettingsPage } from "./features/settings/AccountSettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<GlobalDashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />

          <Route path="/projects/:projectId" element={<ProjectScopedLayout />}>
            <Route index element={<ProjectDashboardPage />} />

            <Route path="requirements" element={<RequirementsEngineLayout />}>
              <Route index element={<Navigate to="list" replace />} />
              <Route path="list" element={<RequirementsPage />} />
              <Route path="network-map" element={<NetworkMapPage />} />
              <Route path="ledger" element={<LedgerPage />} />
              <Route path="alignment" element={<AlignmentScorePage />} />
              <Route path="analytics" element={<SignalAnalyticsPage />} />
            </Route>

            <Route path="gap-detection" element={<GapDetectionLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<GapOverviewPage />} />
              <Route path="workspace" element={<GapWorkspacePage />} />
              <Route path="inventory" element={<GapInventoryPage />} />
              <Route path="propagation" element={<ImpactPropagationPage />} />
              <Route path="assessment" element={<ImpactAssessmentPage />} />
            </Route>

            <Route path="schedule" element={<ScheduleLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ScheduleOverviewPage />} />
              <Route path="day" element={<DayViewPage />} />
              <Route path="week" element={<WeekViewPage />} />
              <Route path="sprint" element={<SprintViewPage />} />
              <Route path="project-timeline" element={<ProjectTimelinePage />} />
            </Route>
            <Route path="board" element={<KanbanBoardPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="meetings" element={<MeetingsPage />} />

            <Route path="retro-intelligence" element={<RetroIntelligenceLayout />}>
              <Route index element={<Navigate to="retrospectives" replace />} />
              <Route path="retrospectives" element={<RetrospectivesListPage />} />
              <Route path="overview" element={<RIOverviewPage />} />
              <Route path="cross-validation" element={<CrossValidationPage />} />
              <Route path="actions" element={<ActionTrackerPage />} />
              <Route path="evidence" element={<EvidenceLedgerPage />} />
              <Route path="learning-loop" element={<LearningLoopPage />} />
              <Route path="reports" element={<RIReportsPage />} />
            </Route>
            <Route
              path="settings"
              element={
                <RequirePM>
                  <ProjectSettingsPage />
                </RequirePM>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
