// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let sadImg;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
  sadImg = loadImage('sad.png'); // 載入圖片
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

let faceLandmarks = [
  { name: "forehead", x: 320, y: 100 },
  { name: "leftEye", x: 250, y: 180 },
  { name: "rightEye", x: 390, y: 180 },
  { name: "leftCheek", x: 200, y: 250 },
  { name: "rightCheek", x: 440, y: 250 }
];

// 判斷手勢類型
function detectGesture(hand) {
  // 以手指張開數量判斷
  // 假設 keypoints[8]食指, keypoints[12]中指, keypoints[16]無名指, keypoints[20]小指, keypoints[4]拇指
  // 若食指與中指張開，其餘收起，視為剪刀
  // 若全部收起，視為石頭
  // 若全部張開，視為布

  let fingers = [8, 12, 16, 20];
  let openCount = 0;
  for (let i of fingers) {
    if (hand.keypoints[i].y < hand.keypoints[0].y - 30) openCount++; // 粗略判斷指尖高於手腕
  }

  if (openCount === 2 && 
      hand.keypoints[8].y < hand.keypoints[0].y - 30 && 
      hand.keypoints[12].y < hand.keypoints[0].y - 30 &&
      hand.keypoints[16].y > hand.keypoints[0].y - 10 &&
      hand.keypoints[20].y > hand.keypoints[0].y - 10) {
    return "scissors";
  } else if (openCount === 0) {
    return "rock";
  } else if (openCount === 4) {
    return "paper";
  }
  return "none";
}

function draw() {
  image(video, 0, 0);

  let gesture = "none";
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 畫手部關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }
          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }
        // 只取第一隻手的手勢
        gesture = detectGesture(hand);
        break;
      }
    }
  }

  fill(255, 0, 0);
  noStroke();
  if (gesture === "scissors") {
    // 額頭
    let f = faceLandmarks.find(pt => pt.name === "forehead");
    circle(f.x, f.y, 30);
  } else if (gesture === "rock") {
    // 左右眼
    let l = faceLandmarks.find(pt => pt.name === "leftEye");
    let r = faceLandmarks.find(pt => pt.name === "rightEye");
    circle(l.x, l.y, 30);
    circle(r.x, r.y, 30);
  } else if (gesture === "paper") {
    // 左右臉頰
    let l = faceLandmarks.find(pt => pt.name === "leftCheek");
    let r = faceLandmarks.find(pt => pt.name === "rightCheek");
    // 計算臉頰中點
    let cx = (l.x + r.x) / 2;
    let cy = (l.y + r.y) / 2;
    // 顯示圖片（可調整大小與位置）
    imageMode(CENTER);
    image(sadImg, cx, cy, 120, 120);
  }
}
