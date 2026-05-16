import cv2
from cvzone.PoseModule import PoseDetector

cap = cv2.VideoCapture(0)
detector = PoseDetector()
counter = 0
stage = None

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Тёмный фильтр на фон
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (250, 180), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.4, frame, 0.6, 0, frame)

    frame = detector.findPose(frame)
    lmList, bboxInfo = detector.findPosition(frame)

    if lmList:
        p1 = (lmList[11][0], lmList[11][1])
        p2 = (lmList[13][0], lmList[13][1])
        p3 = (lmList[15][0], lmList[15][1])

        angle, img = detector.findAngle(p1, p2, p3)

        if angle > 155:
            stage = "up"
        if angle < 75 and stage == "up":
            stage = "down"
            counter += 1

        # Прогресс бар
        target = 20
        progress = int((counter / target) * 200)
        cv2.rectangle(frame, (50, 400), (250, 420), (50, 50, 50), -1)
        cv2.rectangle(frame, (50, 400), (50 + progress, 420), (0, 255, 100), -1)
        cv2.putText(frame, f'{counter}/{target}',
            (50, 395), cv2.FONT_HERSHEY_SIMPLEX,
            0.6, (255, 255, 255), 1)

        # Красивый счётчик
        cv2.putText(frame, str(counter),
            (80, 120), cv2.FONT_HERSHEY_SIMPLEX,
            4, (0, 255, 100), 8)
        cv2.putText(frame, 'REPS',
            (85, 155), cv2.FONT_HERSHEY_SIMPLEX,
            0.8, (200, 200, 200), 2)

        # Stage индикатор
        color = (0, 255, 0) if stage == "up" else (0, 100, 255)
        cv2.putText(frame, str(stage).upper(),
            (50, 50), cv2.FONT_HERSHEY_SIMPLEX,
            1, color, 2)

    cv2.imshow('FitChallenge', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()