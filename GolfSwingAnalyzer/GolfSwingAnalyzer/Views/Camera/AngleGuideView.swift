import SwiftUI

/// Visual guide overlay showing proper camera positioning for each angle
struct AngleGuideView: View {
    let cameraAngle: CameraAngle
    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: 8) {
            // Compact guide
            Button {
                withAnimation(.spring(response: 0.3)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "info.circle.fill")
                    Text(cameraAngle.rawValue)
                        .fontWeight(.semibold)
                    Image(systemName: isExpanded ? "chevron.down" : "chevron.up")
                        .font(.caption)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
                .foregroundStyle(.white)
            }

            if isExpanded {
                VStack(alignment: .leading, spacing: 12) {
                    // Setup diagram
                    setupDiagram
                        .frame(height: 120)
                        .frame(maxWidth: .infinity)

                    // Instructions
                    Text(cameraAngle.setupInstructions)
                        .font(.callout)
                        .foregroundStyle(.white)

                    // Checklist
                    VStack(alignment: .leading, spacing: 6) {
                        checkItem("Phone at \(cameraAngle == .downTheLine ? "hand" : "waist") height")
                        checkItem("~10 feet from golfer")
                        checkItem("Full body visible in frame")
                        if cameraAngle == .downTheLine {
                            checkItem("Aligned with target line")
                        } else {
                            checkItem("Perpendicular to target line")
                        }
                    }
                }
                .padding(16)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .padding(.horizontal, 20)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
    }

    private func checkItem(_ text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.circle")
                .foregroundStyle(.green)
                .font(.caption)
            Text(text)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.9))
        }
    }

    @ViewBuilder
    private var setupDiagram: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height

            ZStack {
                if cameraAngle == .downTheLine {
                    // DTL diagram: camera behind golfer, aligned with target
                    dtlDiagram(width: width, height: height)
                } else {
                    // Face On diagram: camera to the side
                    faceOnDiagram(width: width, height: height)
                }
            }
        }
    }

    private func dtlDiagram(width: CGFloat, height: CGFloat) -> some View {
        ZStack {
            // Target line
            Path { path in
                path.move(to: CGPoint(x: width * 0.5, y: height * 0.1))
                path.addLine(to: CGPoint(x: width * 0.5, y: height * 0.9))
            }
            .stroke(.green.opacity(0.6), style: StrokeStyle(lineWidth: 2, dash: [8, 4]))

            // Golfer icon
            Image(systemName: "figure.golf")
                .font(.system(size: 30))
                .foregroundStyle(.white)
                .position(x: width * 0.5, y: height * 0.35)

            // Camera icon
            Image(systemName: "camera.fill")
                .font(.system(size: 20))
                .foregroundStyle(.yellow)
                .position(x: width * 0.5, y: height * 0.8)

            // Labels
            Text("Target")
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(.green)
                .position(x: width * 0.5, y: height * 0.05)

            Text("You")
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(.white.opacity(0.7))
                .position(x: width * 0.65, y: height * 0.35)

            Text("Camera")
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(.yellow)
                .position(x: width * 0.65, y: height * 0.8)
        }
    }

    private func faceOnDiagram(width: CGFloat, height: CGFloat) -> some View {
        ZStack {
            // Target line
            Path { path in
                path.move(to: CGPoint(x: width * 0.2, y: height * 0.5))
                path.addLine(to: CGPoint(x: width * 0.8, y: height * 0.5))
            }
            .stroke(.green.opacity(0.6), style: StrokeStyle(lineWidth: 2, dash: [8, 4]))

            // Camera line (perpendicular)
            Path { path in
                path.move(to: CGPoint(x: width * 0.5, y: height * 0.15))
                path.addLine(to: CGPoint(x: width * 0.5, y: height * 0.85))
            }
            .stroke(.yellow.opacity(0.4), style: StrokeStyle(lineWidth: 1, dash: [4, 4]))

            // Golfer icon
            Image(systemName: "figure.golf")
                .font(.system(size: 30))
                .foregroundStyle(.white)
                .position(x: width * 0.5, y: height * 0.35)

            // Camera icon
            Image(systemName: "camera.fill")
                .font(.system(size: 20))
                .foregroundStyle(.yellow)
                .position(x: width * 0.5, y: height * 0.85)

            // Labels
            Text("Target →")
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(.green)
                .position(x: width * 0.78, y: height * 0.42)

            Text("Camera")
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(.yellow)
                .position(x: width * 0.65, y: height * 0.85)
        }
    }
}
