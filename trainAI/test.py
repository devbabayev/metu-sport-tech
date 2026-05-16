import cv2
import pyttsx3
import threading
from cvzone.PoseModule import PoseDetector

is_speaking = False

def speak(text):
    global is_speaking
    if is_speaking:
        return
    def run():
        global is_speaking
        is_speaking = True
        e = pyttsx3.init()
        e.setProperty('rate', 150)
        e.say(text)
        e.runAndWait()
        is_speaking = False
    threading.Thread(target=run, daemon=True).start()

cap = cv2.VideoCapture(0)
detector = PoseDetector()
counter = 0
stage = None

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = detector.findPose(frame)
    lmList, bboxInfo = detector.findPosition(frame)

    if lmList:
        p1 = (lmList[11][0], lmList[11][1])
        p2 = (lmList[13][0], lmList[13][1])
        p3 = (lmList[15][0], lmList[15][1])
        elbow_angle, _ = detector.findAngle(p1, p2, p3)

        s = (lmList[11][0], lmList[11][1])
        h = (lmList[23][0], lmList[23][1])
        k = (lmList[25][0], lmList[25][1])
        back_angle, _ = detector.findAngle(s, h, k)

        back_ok = 167< back_angle < 180

        # Когда поднялся — проверяем спину
        if elbow_angle > 155:
            if stage == "down":
                # Только что поднялся
                if not back_ok:
                    speak("Keep your back straight!")
            stage = "up"

        # Когда опустился — считаем
        if elbow_angle < 75 and stage == "up":
            stage = "down"
            counter += 1

        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (280, 200), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.4, frame, 0.6, 0, frame)

        cv2.putText(frame, str(counter),
            (80, 120), cv2.FONT_HERSHEY_SIMPLEX,
            4, (0, 255, 100), 8)
        cv2.putText(frame, 'REPS',
            (85, 155), cv2.FONT_HERSHEY_SIMPLEX,
            0.8, (200, 200, 200), 2)

        back_color = (0, 255, 0) if back_ok else (0, 0, 255)
        back_text = "BACK: OK" if back_ok else "BACK: FIX!"
        cv2.putText(frame, back_text,
            (50, 50), cv2.FONT_HERSHEY_SIMPLEX,
            0.8, back_color, 2)

        target = 20
        progress = int((counter / target) * 200)
        cv2.rectangle(frame, (50, 400), (250, 420), (50, 50, 50), -1)
        cv2.rectangle(frame, (50, 400), (50 + progress, 420), (0, 255, 100), -1)
        cv2.putText(frame, f'{counter}/{target}',
            (50, 395), cv2.FONT_HERSHEY_SIMPLEX,
            0.6, (255, 255, 255), 1)

    cv2.imshow('FitChallenge', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()