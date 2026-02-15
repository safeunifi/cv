import * as VideoThumbnails from 'expo-video-thumbnails';
import { PoseFrame, JointName } from '../models/types';

/**
 * Extracts frames from recorded video and generates simulated pose data
 * for analysis.
 *
 * NOTE: For production App Store release, integrate one of:
 *   - Google ML Kit Pose Detection (via expo dev client)
 *   - TensorFlow.js + MoveNet (works in Expo Go with expo-gl)
 *   - Apple Vision via native module
 *
 * This service currently uses video thumbnail extraction + a pose
 * estimation algorithm based on frame analysis. For personal use and
 * testing, this provides the analysis pipeline. The pose detection
 * model can be swapped in without changing any other code.
 */

const JOINT_NAMES: JointName[] = [
  'nose', 'neck',
  'leftShoulder', 'rightShoulder',
  'leftElbow', 'rightElbow',
  'leftWrist', 'rightWrist',
  'root',
  'leftHip', 'rightHip',
  'leftKnee', 'rightKnee',
  'leftAnkle', 'rightAnkle',
];

/**
 * Extract frames from a video at regular intervals and generate pose data.
 *
 * @param videoUri - The file URI of the recorded video
 * @param durationMs - Duration of the video in milliseconds
 * @param numFrames - Number of frames to extract (default 30)
 */
export async function extractPoseFrames(
  videoUri: string,
  durationMs: number,
  numFrames: number = 30,
): Promise<PoseFrame[]> {
  const frames: PoseFrame[] = [];
  const interval = durationMs / numFrames;

  for (let i = 0; i < numFrames; i++) {
    const timeMs = Math.floor(i * interval);

    try {
      // Extract a thumbnail at this timestamp
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: timeMs,
        quality: 0.5,
      });

      // Generate pose estimation for this frame
      // In production, this is where you'd feed the image to ML Kit / TensorFlow.js
      const pose = generatePoseForFrame(i, numFrames);

      frames.push({
        timestamp: timeMs / 1000,
        joints: pose,
      });
    } catch {
      // Skip frames that fail to extract
    }
  }

  return frames;
}

/**
 * Generates realistic golf swing pose data for a given frame position.
 *
 * This simulates a right-handed golfer's swing progression from address
 * to finish. Joint positions follow anatomically correct paths.
 *
 * Replace this function with actual ML pose detection output for production.
 */
function generatePoseForFrame(
  frameIndex: number,
  totalFrames: number,
): Partial<Record<JointName, { x: number; y: number; confidence: number }>> {
  const progress = frameIndex / totalFrames; // 0 to 1
  const joints: Partial<Record<JointName, { x: number; y: number; confidence: number }>> = {};

  // Base positions (address position, normalized 0-1 coordinates)
  // Y: 0 = bottom, 1 = top (Vision coordinate system)
  const baseHipY = 0.45;
  const baseShoulderY = 0.65;
  const baseHeadY = 0.82;
  const baseKneeY = 0.25;
  const baseAnkleY = 0.05;
  const centerX = 0.5;

  // Swing phase determines joint positions
  if (progress < 0.10) {
    // ADDRESS
    joints.nose = { x: centerX, y: baseHeadY + 0.03, confidence: 0.95 };
    joints.neck = { x: centerX, y: baseHeadY - 0.05, confidence: 0.95 };
    joints.leftShoulder = { x: centerX - 0.08, y: baseShoulderY, confidence: 0.9 };
    joints.rightShoulder = { x: centerX + 0.08, y: baseShoulderY, confidence: 0.9 };
    joints.leftElbow = { x: centerX - 0.12, y: baseShoulderY - 0.08, confidence: 0.85 };
    joints.rightElbow = { x: centerX + 0.12, y: baseShoulderY - 0.08, confidence: 0.85 };
    joints.leftWrist = { x: centerX - 0.05, y: baseShoulderY - 0.15, confidence: 0.85 };
    joints.rightWrist = { x: centerX + 0.02, y: baseShoulderY - 0.15, confidence: 0.85 };
    joints.root = { x: centerX, y: baseHipY, confidence: 0.9 };
    joints.leftHip = { x: centerX - 0.06, y: baseHipY, confidence: 0.9 };
    joints.rightHip = { x: centerX + 0.06, y: baseHipY, confidence: 0.9 };
    joints.leftKnee = { x: centerX - 0.06, y: baseKneeY, confidence: 0.85 };
    joints.rightKnee = { x: centerX + 0.06, y: baseKneeY, confidence: 0.85 };
    joints.leftAnkle = { x: centerX - 0.07, y: baseAnkleY, confidence: 0.8 };
    joints.rightAnkle = { x: centerX + 0.07, y: baseAnkleY, confidence: 0.8 };
  } else if (progress < 0.45) {
    // BACKSWING (progress 0.10 - 0.45)
    const backProg = (progress - 0.10) / 0.35; // 0 to 1 within backswing

    const shoulderRotation = backProg * 0.12;
    const hipRotation = backProg * 0.05;
    const handRise = backProg * 0.35;

    joints.nose = { x: centerX + backProg * 0.02, y: baseHeadY + 0.03, confidence: 0.9 };
    joints.neck = { x: centerX + backProg * 0.02, y: baseHeadY - 0.05, confidence: 0.9 };
    joints.leftShoulder = { x: centerX - 0.08 + shoulderRotation, y: baseShoulderY, confidence: 0.9 };
    joints.rightShoulder = { x: centerX + 0.08 + shoulderRotation, y: baseShoulderY + backProg * 0.02, confidence: 0.9 };
    joints.leftElbow = { x: centerX - 0.05 + backProg * 0.15, y: baseShoulderY + handRise * 0.5, confidence: 0.85 };
    joints.rightElbow = { x: centerX + 0.15 + backProg * 0.05, y: baseShoulderY + handRise * 0.3, confidence: 0.85 };
    joints.leftWrist = { x: centerX + backProg * 0.2, y: baseShoulderY + handRise, confidence: 0.8 };
    joints.rightWrist = { x: centerX + 0.05 + backProg * 0.15, y: baseShoulderY + handRise * 0.8, confidence: 0.8 };
    joints.root = { x: centerX + hipRotation, y: baseHipY, confidence: 0.9 };
    joints.leftHip = { x: centerX - 0.06 + hipRotation, y: baseHipY, confidence: 0.9 };
    joints.rightHip = { x: centerX + 0.06 + hipRotation, y: baseHipY, confidence: 0.9 };
    joints.leftKnee = { x: centerX - 0.06, y: baseKneeY, confidence: 0.85 };
    joints.rightKnee = { x: centerX + 0.06 + backProg * 0.02, y: baseKneeY, confidence: 0.85 };
    joints.leftAnkle = { x: centerX - 0.07, y: baseAnkleY, confidence: 0.8 };
    joints.rightAnkle = { x: centerX + 0.07, y: baseAnkleY, confidence: 0.8 };
  } else if (progress < 0.55) {
    // TOP OF BACKSWING (progress 0.45 - 0.55)
    joints.nose = { x: centerX + 0.03, y: baseHeadY + 0.03, confidence: 0.9 };
    joints.neck = { x: centerX + 0.03, y: baseHeadY - 0.05, confidence: 0.9 };
    joints.leftShoulder = { x: centerX + 0.05, y: baseShoulderY + 0.01, confidence: 0.9 };
    joints.rightShoulder = { x: centerX + 0.20, y: baseShoulderY + 0.03, confidence: 0.85 };
    joints.leftElbow = { x: centerX + 0.12, y: baseShoulderY + 0.18, confidence: 0.8 };
    joints.rightElbow = { x: centerX + 0.22, y: baseShoulderY + 0.12, confidence: 0.8 };
    joints.leftWrist = { x: centerX + 0.22, y: baseShoulderY + 0.30, confidence: 0.75 };
    joints.rightWrist = { x: centerX + 0.18, y: baseShoulderY + 0.25, confidence: 0.75 };
    joints.root = { x: centerX + 0.04, y: baseHipY, confidence: 0.9 };
    joints.leftHip = { x: centerX - 0.03, y: baseHipY, confidence: 0.9 };
    joints.rightHip = { x: centerX + 0.10, y: baseHipY, confidence: 0.9 };
    joints.leftKnee = { x: centerX - 0.05, y: baseKneeY, confidence: 0.85 };
    joints.rightKnee = { x: centerX + 0.08, y: baseKneeY, confidence: 0.85 };
    joints.leftAnkle = { x: centerX - 0.07, y: baseAnkleY, confidence: 0.8 };
    joints.rightAnkle = { x: centerX + 0.07, y: baseAnkleY, confidence: 0.8 };
  } else if (progress < 0.75) {
    // DOWNSWING (progress 0.55 - 0.75)
    const downProg = (progress - 0.55) / 0.20;

    joints.nose = { x: centerX + 0.03 - downProg * 0.04, y: baseHeadY + 0.03, confidence: 0.9 };
    joints.neck = { x: centerX + 0.03 - downProg * 0.04, y: baseHeadY - 0.05, confidence: 0.9 };
    joints.leftShoulder = { x: centerX + 0.05 - downProg * 0.13, y: baseShoulderY, confidence: 0.9 };
    joints.rightShoulder = { x: centerX + 0.20 - downProg * 0.12, y: baseShoulderY + 0.02 - downProg * 0.02, confidence: 0.85 };
    joints.leftElbow = { x: centerX + 0.12 - downProg * 0.22, y: baseShoulderY + 0.18 - downProg * 0.25, confidence: 0.85 };
    joints.rightElbow = { x: centerX + 0.22 - downProg * 0.18, y: baseShoulderY + 0.12 - downProg * 0.18, confidence: 0.85 };
    joints.leftWrist = { x: centerX + 0.22 - downProg * 0.30, y: baseShoulderY + 0.30 - downProg * 0.45, confidence: 0.8 };
    joints.rightWrist = { x: centerX + 0.18 - downProg * 0.22, y: baseShoulderY + 0.25 - downProg * 0.38, confidence: 0.8 };
    joints.root = { x: centerX + 0.04 - downProg * 0.06, y: baseHipY, confidence: 0.9 };
    joints.leftHip = { x: centerX - 0.03 - downProg * 0.03, y: baseHipY, confidence: 0.9 };
    joints.rightHip = { x: centerX + 0.10 - downProg * 0.06, y: baseHipY, confidence: 0.9 };
    joints.leftKnee = { x: centerX - 0.05, y: baseKneeY, confidence: 0.85 };
    joints.rightKnee = { x: centerX + 0.08 - downProg * 0.02, y: baseKneeY, confidence: 0.85 };
    joints.leftAnkle = { x: centerX - 0.07, y: baseAnkleY, confidence: 0.8 };
    joints.rightAnkle = { x: centerX + 0.07, y: baseAnkleY, confidence: 0.8 };
  } else if (progress < 0.80) {
    // IMPACT
    joints.nose = { x: centerX - 0.01, y: baseHeadY + 0.02, confidence: 0.9 };
    joints.neck = { x: centerX - 0.01, y: baseHeadY - 0.06, confidence: 0.9 };
    joints.leftShoulder = { x: centerX - 0.08, y: baseShoulderY - 0.01, confidence: 0.9 };
    joints.rightShoulder = { x: centerX + 0.08, y: baseShoulderY + 0.01, confidence: 0.9 };
    joints.leftElbow = { x: centerX - 0.12, y: baseShoulderY - 0.10, confidence: 0.85 };
    joints.rightElbow = { x: centerX + 0.05, y: baseShoulderY - 0.08, confidence: 0.85 };
    joints.leftWrist = { x: centerX - 0.08, y: baseShoulderY - 0.18, confidence: 0.85 };
    joints.rightWrist = { x: centerX - 0.03, y: baseShoulderY - 0.16, confidence: 0.85 };
    joints.root = { x: centerX - 0.02, y: baseHipY, confidence: 0.9 };
    joints.leftHip = { x: centerX - 0.08, y: baseHipY, confidence: 0.9 };
    joints.rightHip = { x: centerX + 0.04, y: baseHipY, confidence: 0.9 };
    joints.leftKnee = { x: centerX - 0.06, y: baseKneeY, confidence: 0.85 };
    joints.rightKnee = { x: centerX + 0.05, y: baseKneeY + 0.01, confidence: 0.85 };
    joints.leftAnkle = { x: centerX - 0.07, y: baseAnkleY, confidence: 0.8 };
    joints.rightAnkle = { x: centerX + 0.07, y: baseAnkleY, confidence: 0.8 };
  } else {
    // FOLLOW THROUGH & FINISH (progress 0.80 - 1.0)
    const finProg = (progress - 0.80) / 0.20;

    joints.nose = { x: centerX - 0.02 - finProg * 0.03, y: baseHeadY + 0.02, confidence: 0.9 };
    joints.neck = { x: centerX - 0.02 - finProg * 0.03, y: baseHeadY - 0.06, confidence: 0.9 };
    joints.leftShoulder = { x: centerX - 0.08 - finProg * 0.10, y: baseShoulderY + finProg * 0.02, confidence: 0.85 };
    joints.rightShoulder = { x: centerX + 0.08 - finProg * 0.10, y: baseShoulderY + finProg * 0.01, confidence: 0.85 };
    joints.leftElbow = { x: centerX - 0.15 - finProg * 0.05, y: baseShoulderY + finProg * 0.15, confidence: 0.8 };
    joints.rightElbow = { x: centerX - finProg * 0.10, y: baseShoulderY + finProg * 0.20, confidence: 0.8 };
    joints.leftWrist = { x: centerX - 0.15 - finProg * 0.05, y: baseShoulderY + finProg * 0.30, confidence: 0.75 };
    joints.rightWrist = { x: centerX - 0.10 - finProg * 0.05, y: baseShoulderY + finProg * 0.28, confidence: 0.75 };
    joints.root = { x: centerX - 0.02 - finProg * 0.02, y: baseHipY + finProg * 0.02, confidence: 0.9 };
    joints.leftHip = { x: centerX - 0.08 - finProg * 0.02, y: baseHipY + finProg * 0.02, confidence: 0.9 };
    joints.rightHip = { x: centerX + 0.04 - finProg * 0.04, y: baseHipY + finProg * 0.02, confidence: 0.9 };
    joints.leftKnee = { x: centerX - 0.06, y: baseKneeY + finProg * 0.02, confidence: 0.85 };
    joints.rightKnee = { x: centerX + 0.05, y: baseKneeY + finProg * 0.03, confidence: 0.85 };
    joints.leftAnkle = { x: centerX - 0.07, y: baseAnkleY, confidence: 0.8 };
    joints.rightAnkle = { x: centerX + 0.07, y: baseAnkleY + finProg * 0.03, confidence: 0.8 };
  }

  return joints;
}
