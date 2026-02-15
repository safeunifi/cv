import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .capture

    enum Tab: String, CaseIterable {
        case capture = "Capture"
        case history = "History"
        case drills = "Drills"
        case progress = "Progress"

        var icon: String {
            switch self {
            case .capture: return "camera.viewfinder"
            case .history: return "clock.arrow.circlepath"
            case .drills: return "figure.golf"
            case .progress: return "chart.line.uptrend.xyaxis"
            }
        }
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            CaptureView()
                .tabItem {
                    Label(Tab.capture.rawValue, systemImage: Tab.capture.icon)
                }
                .tag(Tab.capture)

            HistoryView()
                .tabItem {
                    Label(Tab.history.rawValue, systemImage: Tab.history.icon)
                }
                .tag(Tab.history)

            DrillsView()
                .tabItem {
                    Label(Tab.drills.rawValue, systemImage: Tab.drills.icon)
                }
                .tag(Tab.drills)

            ProgressView()
                .tabItem {
                    Label(Tab.progress.rawValue, systemImage: Tab.progress.icon)
                }
                .tag(Tab.progress)
        }
        .tint(.accentColor)
    }
}

#Preview {
    ContentView()
}
