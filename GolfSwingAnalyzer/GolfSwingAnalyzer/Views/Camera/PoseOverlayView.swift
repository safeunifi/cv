import SwiftUI

/// Draws detected body pose skeleton over the camera preview
struct PoseOverlayView: View {
    let points: [CGPoint]
    let connections: [(CGPoint, CGPoint)]

    var body: some View {
        GeometryReader { geometry in
            let size = geometry.size

            ZStack {
                // Draw skeleton connections
                ForEach(0..<connections.count, id: \.self) { index in
                    let connection = connections[index]
                    Path { path in
                        let start = convertPoint(connection.0, in: size)
                        let end = convertPoint(connection.1, in: size)
                        path.move(to: start)
                        path.addLine(to: end)
                    }
                    .stroke(
                        LinearGradient(
                            colors: [.green, .cyan],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        lineWidth: 3
                    )
                }

                // Draw joint points
                ForEach(0..<points.count, id: \.self) { index in
                    let converted = convertPoint(points[index], in: size)
                    Circle()
                        .fill(.green)
                        .frame(width: 8, height: 8)
                        .shadow(color: .green.opacity(0.8), radius: 4)
                        .position(converted)
                }
            }
        }
        .allowsHitTesting(false)
    }

    /// Convert Vision normalized coordinates to view coordinates
    /// Vision uses bottom-left origin, SwiftUI uses top-left
    private func convertPoint(_ point: CGPoint, in size: CGSize) -> CGPoint {
        CGPoint(
            x: point.x * size.width,
            y: (1 - point.y) * size.height
        )
    }
}
