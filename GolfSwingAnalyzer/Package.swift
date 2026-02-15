// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GolfSwingAnalyzer",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "GolfSwingAnalyzer", targets: ["GolfSwingAnalyzer"]),
    ],
    targets: [
        .target(name: "GolfSwingAnalyzer", path: "GolfSwingAnalyzer"),
    ]
)
